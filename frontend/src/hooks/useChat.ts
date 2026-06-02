import { useEffect, useState, useCallback } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Helper function to emit delivery receipt for a message
  const emitDeliveryReceipt = useCallback((message: Message) => {
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
  }, [currentUserId, socket]);

  // Load initial history (Backend sends newest first)
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ messages: Message[], hasMore: boolean }>(
          `/api/messages/${roomId}?page=1&limit=50`
        );
        // data.messages is [newest ... older]
        setMessages(data.messages);
        setHasMore(data.hasMore);
        setPage(1);

        data.messages.forEach(emitDeliveryReceipt);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [roomId, socket, currentUserId, emitDeliveryReceipt]);

  // Load more messages (Older history)
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { data } = await api.get<{ messages: Message[], hasMore: boolean }>(
        `/api/messages/${roomId}?page=${nextPage}&limit=50`
      );
      
      if (data.messages.length > 0) {
        // data.messages is [older ... oldest]
        // Appending to the end of our newest-first array
        setMessages((prev) => [...prev, ...data.messages]);
        setPage(nextPage);
        setHasMore(data.hasMore);
        
        data.messages.forEach(emitDeliveryReceipt);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more messages", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);

    const handleMessage = (message: Message) => {
      if (message.roomId !== roomId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;

        emitDeliveryReceipt(message);

        // Prepend new message to keep newest at index 0
        return [message, ...prev];
      });
    };

    const handleMessageUpdated = (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
    };

    const handleMessageDelivered = (data: { messageId: string }) => {
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

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId);

      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED, handleMessageDelivered);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    };
  }, [socket, roomId, emitDeliveryReceipt]);

  const sendMessage = (content: string) => {
    const tempId = Date.now().toString();
    const tempMessage: Message = {
      _id: tempId,
      roomId,
      sender: {
        _id: currentUserId,
        username: "",
      },
      content,
      status: "sending",
      createdAt: new Date(),
    };

    // Prepend optimistic update
    setMessages((prev) => [tempMessage, ...prev]);

    socket?.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      roomId,
      content,
    });
  };

  const editMessage = (messageId: string, content: string) => {
    socket?.emit(SOCKET_EVENTS.EDIT_MESSAGE, {
      messageId,
      content,
      roomId,
    });
  };

  const deleteMessage = (messageId: string) => {
    socket?.emit(SOCKET_EVENTS.DELETE_MESSAGE, {
      messageId,
      roomId,
    });
  };

  const markAsRead = (messageId: string) => {
    socket?.emit(SOCKET_EVENTS.MARK_READ, { messageId });
  };

  return {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    markAsRead,
    loading,
    loadingMore,
    hasMore,
  };
};
