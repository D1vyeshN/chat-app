// src/components/chat/MessageInput.tsx
"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { Message, Room, User } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents> | null;

interface MessageInputProps {
  socket: ChatSocket;
  room: Room;
  currentUser: User;
}

export default function MessageInput({
  socket,
  room,
  currentUser,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    
    socket.emit("send_message", {
      roomId: room._id,
      content: message.trim(),
    });

    socket.emit("stop_typing", {
      roomId: room._id,
      username: currentUser.username,
    });

    setMessage("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!socket) return;

    socket.emit("typing", {
      roomId: room._id,
      username: currentUser.username,
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", {
        roomId: room._id,
        username: currentUser.username,
      });
    }, 2000);
  };

  return (
    <div className="px-6 py-4 border-t border-slate-800 bg-slate-900">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={message}
          onChange={handleChange}
          placeholder={`Message #${room.name}`}
          className="flex-1 bg-slate-800 border-slate-700 text-white
           placeholder:text-slate-500 focus:border-slate-600
           focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          disabled={!message.trim()}
          size="icon"
          className="bg-indigo-600 hover:bg-indigo-700 text-white
           disabled:opacity-50 shrink-0"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
