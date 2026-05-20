// src/types/index.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  isOnline: boolean;
}

export interface Message {
  _id?: string;
  roomId: string;
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  createdAt: Date | string;
  status?: "sending" | "sent" | "delivered" | "read";
}

export interface Room {
  _id: string;
  name: string;
  members: {
    _id: string;
    username: string;
    isOnline: boolean;
  }[];
  createdBy: string;
  createdAt: Date;
  unreadCount?: number | undefined;
}

export interface ServerToClientEvents {
  receive_message: (message: Message) => void;
  user_typing: (data: { roomId: string; username: string }) => void;
  user_online: (userId: string) => void;
  user_connected: (data: { userId: string }) => void;
  user_offline: (userId: string) => void;
  user_stopped_typing: (data: { roomId: string }) => void;
  error: (message: string) => void;
  room_notification: (data: {
    roomId: string;
    roomName: string;
    unreadCount: number;
    lastMessage: string;
  }) => void;
  unread_count_updated: (data: { roomId: string; unreadCount: number }) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: { roomId: string; content: string }) => void;
  typing: (data: { roomId: string; username: string }) => void;
  stop_typing: (data: { roomId: string; username: string }) => void;
}
