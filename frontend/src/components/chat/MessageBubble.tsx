"use client";

// src/components/chat/MessageBubble.tsx
import { Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  markAsRead?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar,
  markAsRead,
}: MessageBubbleProps) {
  const messageRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedRead = useRef(false);

  function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }

  function CheckIcon({ className }: { className?: string }) {
    return (
      <svg
        className={className}
        width="16"
        height="11"
        viewBox="0 0 16 11"
        fill="none"
      >
        <path
          d="M1 5.5L4.5 9L11 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function DoubleCheckIcon({ className }: { className?: string }) {
    return (
      <svg
        className={className}
        width="20"
        height="11"
        viewBox="0 0 20 11"
        fill="none"
      >
        <path
          d="M1 5.5L4.5 9L11 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 5.5L9.5 9L16 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function StatusIndicator({ status }: { status: Message["status"] }) {
    if (status === "sending") {
      return (
        <span className="inline-flex items-center text-gray-400 dark:text-gray-500">
          <svg
            className="animate-spin h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
      );
    }
    if (status === "sent") {
      return <CheckIcon className="text-gray-400 dark:text-gray-500" />;
    }
    if (status === "delivered") {
      return <DoubleCheckIcon className="text-gray-400 dark:text-gray-500" />;
    }
    if (status === "read") {
      return <DoubleCheckIcon className="text-blue-500 dark:text-blue-400" />;
    }
    return null;
  }

 useEffect(() => {
  if (isMine) return;

  if (message.status === "read") return;

  if (hasMarkedRead.current) return;

  if (!messageRef.current) return;

  let timeoutId: NodeJS.Timeout;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !document.hidden &&
          !hasMarkedRead.current
        ) {
          timeoutId = setTimeout(() => {
            hasMarkedRead.current = true;

            markAsRead?.(message._id as string);

            observer.unobserve(entry.target);
          }, 500);
        }
      });
    },
    {
      threshold: 0.6,
    }
  );

  observer.observe(messageRef.current);

  return () => {
    observer.disconnect();

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}, [isMine, message._id, message.status, markAsRead]);

  return (
    <div
      ref={messageRef}
      className={`flex mt-4 items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isMine && (
        <div className="w-8 shrink-0">
          {showAvatar && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {message.sender.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`flex flex-col max-w-xs lg:max-w-md
        ${isMine ? "items-end" : "items-start"}`}
      >
        {/* Username */}
        {!isMine && showAvatar && (
          <span className="text-xs text-indigo-400 mb-1 ml-1 capitalize">
            {message.sender.username}
          </span>
        )}

        <div
          className={`px-4 pb-2 pt-3 rounded-2xl
          ${
            isMine
              ? "bg-indigo-500 text-white rounded-br-none"
              : "bg-slate-800 text-slate-100 rounded-bl-none"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
          {/* Time */}
          <div
            className={`flex pt-2 ${isMine ? "justify-end" : "justify-start"}`}
          >
            {isMine && <StatusIndicator status={message.status} />}
            <span
              className={`text-[10px] ${isMine ? "text-slate-400" : "text-slate-600"}`}
            >
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
