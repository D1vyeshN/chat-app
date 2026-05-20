import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "@/socket/socket-events";
import { Message } from "@/types";
import api from "@/lib/axios";

export const useChat = (
  socket: any,
  roomId: string,
  currentUserId: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to emit delivery receipt for a message
  const emitDeliveryReceipt = (message: Message) => {
    if (
      message.sender._id !== currentUserId &&
      message._id &&
      message.status !== "delivered" &&
      message.status !== "read"
    ) {
      socket?.emit(SOCKET_EVENTS.MESSAGE_DELIVERED_RECEIPT, {
        messageId: message._id,
        senderId: message.sender._id,
      });
    }
  };

  // Load history
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Message[]>(`/api/messages/${roomId}`);
        setMessages(data);

        // Emit delivery receipts for messages from others that are not yet delivered
        data.forEach(emitDeliveryReceipt);
      } catch {
        console.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [roomId, socket, currentUserId]);

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

        // If message is from someone else, emit delivered receipt
        emitDeliveryReceipt(message);

        return [...prev, message];
      });
    };

    const handleMessageDelivered = (data: { messageId: string }) => {
      console.log("Message delivered:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    };

    const handleMessageRead = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, status: "read" }
            : msg
        )
      );
    };

    socket.on(
      SOCKET_EVENTS.RECEIVE_MESSAGE,
      handleMessage
    );
    socket.on(
      SOCKET_EVENTS.MESSAGE_DELIVERED,
      handleMessageDelivered
    );
    socket.on(
      SOCKET_EVENTS.MESSAGE_READ,
      handleMessageRead
    );

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId);

      socket.off(
        SOCKET_EVENTS.RECEIVE_MESSAGE,
        handleMessage
      );
      socket.off(
        SOCKET_EVENTS.MESSAGE_DELIVERED,
        handleMessageDelivered
      );
      socket.off(
        SOCKET_EVENTS.MESSAGE_READ,
        handleMessageRead
      );
    };
  }, [socket, roomId]);

  const sendMessage = (content: string) => {
    const tempId = Date.now().toString();
    const tempMessage: Message = {
      _id: tempId,
      roomId,
      sender: {
        _id: "",
        username: "",
      },
      content,
      status: "sending",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket?.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      roomId,
      content,
    });
  };

  const markAsRead = (messageId: string) => {
    socket?.emit(SOCKET_EVENTS.MARK_READ, { messageId });
  };

  return {
    messages,
    sendMessage,
    markAsRead,
    loading,
  };
};