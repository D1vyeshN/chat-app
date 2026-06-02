"use client";

// src/components/chat/MessageBubble.tsx
import { Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import { Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  markAsRead?: (messageId: string) => void;
  editMessage?: (messageId: string, content: string) => void;
  deleteMessage?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar,
  markAsRead,
  editMessage,
  deleteMessage,
}: MessageBubbleProps) {
  const messageRef = useRef<HTMLDivElement | null>(null);
  const hasMarkedRead = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
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

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage?.(message._id as string, editContent);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage?.(message._id as string);
    }
  };

  return (
    <div
      ref={messageRef}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`flex mt-4 items-end gap-2 group ${isMine ? "flex-row-reverse" : "flex-row"}`}
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
        className={`flex flex-col max-w-[75%] lg:max-w-md relative
        ${isMine ? "items-end" : "items-start"}`}
      >
        {/* Username */}
        {!isMine && showAvatar && (
          <span className="text-xs text-indigo-400 mb-1 ml-1 capitalize">
            {message.sender.username}
          </span>
        )}

        <div
          className={`px-4 pb-2 pt-3 rounded-2xl relative
          ${
            isMine
              ? "bg-indigo-500 text-white rounded-br-none"
              : "bg-slate-800 text-slate-100 rounded-bl-none"
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <div className="flex justify-end gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditing(false)}>
                  <X className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-400" onClick={handleEdit}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
              {/* Time and Status */}
              <div className="flex items-center gap-1 mt-1 justify-end">
                {message.isEdited && (
                  <span className="text-[10px] opacity-50 italic">edited</span>
                )}
                <span className={`text-[10px] ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                  {formatTime(message.createdAt)}
                </span>
                {isMine && <StatusIndicator status={message.status} />}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons (Edit/Delete) */}
        {isMine && showActions && !isEditing && (
          <div className={`absolute top-0 ${isMine ? "-left-12" : "-right-12"} flex gap-1 bg-slate-900/50 p-1 rounded-lg backdrop-blur-sm transition-opacity`}>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
