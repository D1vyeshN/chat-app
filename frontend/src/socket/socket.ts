import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types";

type ChatSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

let socket: ChatSocket | null = null;

export const connectSocket = (token: string): ChatSocket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token },
      transports: ["websocket"],
    });

    console.log("🔥 Socket connected");
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};