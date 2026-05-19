// src/components/chat/MessageList.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { Message, Room, User } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";
import MessageBubble from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageInput from "./MessageInput";
import { useChat } from "@/hooks/useChat";
import { useTyping } from "@/hooks/useTyping";

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents> | null;

interface MessageListProps {
  socket: ChatSocket;
  room: Room;
  currentUser: User;
}

export default function MessageList({
  socket,
  room,
  currentUser,
}: MessageListProps) {
  const { messages, sendMessage, loading, markAsRead } = useChat(socket, room._id, currentUser._id);
  const { typingUser } = useTyping(socket, room._id);
  // const [messages, setMessages] = useState<Message[]>([]);
  // const [typingUser, setTypingUser] = useState("");
  // const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ScrollArea
        suppressHydrationWarning
        className=" min-h-[calc(100vh-138px)] h-[calc(100vh-138px)] px-6 py-4"
      >
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center
         h-full gap-2 py-20"
          >
            <p className="text-slate-500">No messages yet</p>
            <p className="text-slate-600 text-sm">Say hello! 👋</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg._id || i}
                message={msg}
                markAsRead={markAsRead}
                isMine={msg.sender._id === currentUser._id}
                showAvatar={
                  i === 0 || messages[i - 1].sender._id !== msg.sender._id
                }
              />
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 mt-2 px-2">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full
             animate-bounce [animation-delay:-0.3s]"
              />
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full
             animate-bounce [animation-delay:-0.15s]"
              />
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full
             animate-bounce"
              />
            </div>
            <p className="text-slate-500 text-xs">{typingUser} is typing...</p>
          </div>
        )}

        <div ref={bottomRef} />
      </ScrollArea>
      {/* Input */}
      <MessageInput socket={socket} room={room} currentUser={currentUser} />
    </div>
  );
}
