import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "@/socket/socket-events";
import { Message } from "@/types";
import api from "@/lib/axios";

export const useChat = (
  socket: any,
  roomId: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);


    // Load history
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Message[]>(`/api/messages/${roomId}`);
        setMessages(data);
      } catch {
        console.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);

    const handleMessage = (message: Message) => {
      if (message.roomId !== roomId) return;

      setMessages((prev) => {
        const exists = prev.some(
          (m) => m._id === message._id
        );

        if (exists) return prev;

        return [...prev, message];
      });
    };

    socket.on(
      SOCKET_EVENTS.RECEIVE_MESSAGE,
      handleMessage
    );

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId);

      socket.off(
        SOCKET_EVENTS.RECEIVE_MESSAGE,
        handleMessage
      );
    };
  }, [socket, roomId]);

  const sendMessage = (content: string) => {
    socket?.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      roomId,
      content,
    });
  };

  return {
    messages,
    sendMessage,
    loading,
  };
};