import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "@/socket/socket-events";

export const useTyping = (socket: any, roomId: string) => {
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ roomId: r, username }: any) => {
      if (r === roomId) setTypingUser(username);
    };

    const handleStop = () => setTypingUser("");

    socket.on(SOCKET_EVENTS.USER_TYPING, handleTyping);
    socket.on(
      SOCKET_EVENTS.USER_STOPPED_TYPING,
      handleStop
    );

    return () => {
      socket.off(SOCKET_EVENTS.USER_TYPING, handleTyping);
      socket.off(
        SOCKET_EVENTS.USER_STOPPED_TYPING,
        handleStop
      );
    };
  }, [socket, roomId]);

  const typing = (username: string) => {
    socket?.emit(SOCKET_EVENTS.TYPING, {
      roomId,
      username,
    });
  };

  const stopTyping = (username: string) => {
    socket?.emit(SOCKET_EVENTS.STOP_TYPING, {
      roomId,
      username,
    });
  };

  return {
    typingUser,
    typing,
    stopTyping,
  };
};