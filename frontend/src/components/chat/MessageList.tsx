// src/components/chat/MessageList.tsx
"use client";

import { useRef, useEffect } from "react";
import { Message, Room, User } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";
import MessageBubble from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageInput from "./MessageInput";
import { useChat } from "@/hooks/useChat";
import { useTyping } from "@/hooks/useTyping";
import { Loader2 } from "lucide-react";

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
  const { 
    messages, 
    sendMessage, 
    editMessage,
    deleteMessage,
    loadMoreMessages,
    loading, 
    loadingMore,
    hasMore,
    markAsRead 
  } = useChat(socket, room._id, currentUser._id);
  
  const { typingUser } = useTyping(socket, room._id);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-slate-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea
        suppressHydrationWarning
        className="min-h-[calc(100vh-125px)] h-[calc(100vh-125px)] sm:min-h-[calc(100vh-181px)] sm:h-[calc(100vh-181px)] px-6 py-4"
      >
        {/* 
          Using flex-col-reverse to keep newest messages at the bottom.
          The array order is [newest, ..., oldest].
        */}
        <div className="flex flex-col-reverse min-h-full">
          {/* Bottom Anchor */}
          <div ref={bottomRef} />

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex items-center gap-2 mt-2 mb-4 px-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
              <p className="text-slate-500 text-xs">{typingUser} is typing...</p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-1 flex flex-col-reverse">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg._id || i}
                message={msg}
                markAsRead={markAsRead}
                editMessage={editMessage}
                deleteMessage={deleteMessage}
                isMine={msg.sender._id === currentUser._id}
                showAvatar={
                  i === messages.length - 1 || messages[i + 1].sender._id !== msg.sender._id
                }
              />
            ))}
          </div>

          {/* Load More Button (At the top) */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <button 
                onClick={() => loadMoreMessages()}
                disabled={loadingMore}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load earlier messages"
                )}
              </button>
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 py-20">
              <p className="text-slate-500">No messages yet</p>
              <p className="text-slate-600 text-sm">Say hello! 👋</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <MessageInput socket={socket} room={room} currentUser={currentUser} />
    </div>
  );
}
