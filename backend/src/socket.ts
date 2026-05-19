import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload, SendMessageData, TypingData } from "./types";
import User from "./models/user.model";
import Message from "./models/message.model";

// Track online users
const onlineUsers = new Map<string, string>(); // socketId -> userId
const userSockets = new Map<string, string>(); // userId -> socketId

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
      userSockets.set(userId, socket.id);
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
          status: "sent",
        });
        console.log(message);
        await message.populate("sender", "username");

        const sender = message.sender as any;
        console.log(message.content, sender.username);

        //emit to room (excluding sender)
        socket.to(data.roomId).emit("receive_message", {
          _id: message._id.toString(),
          roomId: data.roomId.toString(),
          sender: {
            _id: userId.toString(),
            username: sender.username,
          },
          content: message.content,
          status: message.status,
          createdAt: message.createdAt,
        });

        // Also send to sender
        socket.emit("receive_message", {
          _id: message._id.toString(),
          roomId: data.roomId.toString(),
          sender: {
            _id: userId.toString(),
            username: sender.username,
          },
          content: message.content,
          status: message.status,
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
        username: data.username,
        roomId: data.roomId,
      });
    });

    // ── Mark Read ─────────────────────────────────
    socket.on("mark_read", async (data: { messageId: string }) => {
      try {
        console.log("Mark as read");
        const message = await Message.findByIdAndUpdate(
          data.messageId,
          { status: "read" },
          { returnDocument: "after" },
        ).populate("sender", "username");

        if (message) {
          const sender = message.sender as any;
          const senderId = sender._id.toString();

          // Emit to the sender's socket
          const senderSocketId = userSockets.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_read", {
              messageId: data.messageId,
            });
          }
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // ── Message Delivered Receipt ─────────────────
    socket.on(
      "message_delivered_receipt",
      async (data: { messageId: string; senderId: string }) => {
        try {
          // Update message status to delivered in DB
          await Message.findByIdAndUpdate(data.messageId, {
            status: "delivered",
          });

          // Emit to the sender's socket
          const senderSocketId = userSockets.get(data.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_delivered", {
              messageId: data.messageId,
            });
          }
        } catch (error) {
          console.error("Error processing delivered receipt:", error);
        }
      },
    );

    // ── Disconnect ────────────────────────────────
    socket.on("disconnect", () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        onlineUsers.delete(socket.id);
        userSockets.delete(userId);
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
