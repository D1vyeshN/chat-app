import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload, SendMessageData, TypingData } from "./types";
import User from "./models/user.model";
import Message from "./models/message.model";

// Track online users
const onlineUsers = new Map<string, string>(); // socketId -> userId

const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    // ── Auth ─────────────────────────────────────
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.disconnect();
      return;
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      userId = decoded.userId;

      onlineUsers.set(socket.id, userId);
      console.log(`User ${userId} connected with socket ${socket.id}`);

      //set online in Db
      User.findByIdAndUpdate(userId, { isOnline: true }).exec();

      //notify others
      socket.broadcast.emit("user_connected", { userId });

      console.log(`✅ Authenticated: ${userId}`);
    } catch {
      console.log("❌ Invalid token - disconnecting");
      socket.disconnect();
      return;
    }

    // ── Join Room ─────────────────────────────────
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    // ── Leave Room ────────────────────────────────
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${userId} left room ${roomId}`);
    });

    // ── Send Message ──────────────────────────────\
    socket.on("send_message", async (data: SendMessageData) => {
      try {
        //save in db
        const message = await Message.create({
          sender: userId as any,
          content: data.content,
          roomId: data.roomId,
        });
        console.log(message);
        await message.populate("sender", "username");

        const sender = message.sender as any;
        console.log(message.content,sender.username);

        //emit to room
        io.to(data.roomId).emit("receive_message", {
          _id: message._id.toString(),
          roomId: data.roomId.toString(),
          sender: {
            _id: userId.toString(),
            username: sender.username,
          },
          content: message.content,
          createdAt: message.createdAt,
        });

        console.log("Message sent successfully");
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    // ── Typing ────────────────────────────────────
    socket.on("typing", (data: TypingData) => {
      socket.to(data.roomId).emit("user_typing", data);
    });

    socket.on("stop_typing", (data: TypingData) => {
      socket.to(data.roomId).emit("user_stopped_typing", {
        username: "",
        roomId: data.roomId,
      });
    });

    // ── Disconnect ────────────────────────────────
    socket.on("disconnect", () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        onlineUsers.delete(socket.id);
        console.log(`User ${userId} disconnected`);
        //set offline in Db
        User.findByIdAndUpdate(userId, { isOnline: false }).exec();
        //notify others
        socket.broadcast.emit("user_offline", { userId });
      }
    });
  });
};

export default initSocket;
