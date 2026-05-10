import { Document, Types } from "mongoose";
import { Request } from "express";

// ── Database Models ──────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  createdAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  roomId: Types.ObjectId;
  sender: Types.ObjectId | IUser;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoom extends Document {
  _id: Types.ObjectId;
  name: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── Express ──────────────────────────────────────
export interface AuthRequest extends Request {
  userId?: string
}

// ── JWT ──────────────────────────────────────────
export interface JwtPayload {
  userId: string;
}

// ── Socket Events ────────────────────────────────
export interface ServerToClientEvents {
  receive_message: (message: PopulatedMessage) => void;
  user_typing: (data: TypingData) => void;
  user_online: (userId: string) => void;
  user_offline: (userId: string) => void;
  room_created: (room: IRoom) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: SendMessageData) => void;
  typing: (data: TypingData) => void;
  stop_typing: (data: TypingData) => void;
}

// ── Shared Data Shapes ───────────────────────────
export interface SendMessageData {
  roomId: string;
  content: string;
}

export interface TypingData {
  roomId: string;
  username: string;
}

export interface PopulatedMessage {
  _id: Types.ObjectId;
  roomId: Types.ObjectId;
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
