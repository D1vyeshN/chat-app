import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "@/socket/socket";
import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types";

type ChatSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

const useSocket = (token: string | null) => {
  const [socket, setSocket] = useState<ChatSocket | null>(
    getSocket()
  );

  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);
  }, [token]);

  return socket;
};

export default useSocket;