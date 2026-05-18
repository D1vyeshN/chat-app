import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "@/socket/socket-events";

export const usePresence = (socket: any) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!socket) return;

    const onOnline = (userId: string) => {
      setOnlineUsers((prev) =>
        new Set(prev).add(userId)
      );
    };

    const onOffline = (userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on(SOCKET_EVENTS.USER_CONNECTED, onOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, onOffline);

    return () => {
      socket.off(SOCKET_EVENTS.USER_CONNECTED, onOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, onOffline);
    };
  }, [socket]);

  return { onlineUsers };
};