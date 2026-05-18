// src/components/chat/MessageBubble.tsx
import { Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
}

export default function MessageBubble({
  message,
  isMine,
  showAvatar,
}: MessageBubbleProps) {
  // const formatTime = (date: Date | string) =>
  //   new Date(date).toLocaleTimeString([], {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     timeZone: 'UTC'
  //   })

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return (
      d.getUTCHours().toString().padStart(2, "0") +
      ":" +
      d.getUTCMinutes().toString().padStart(2, "0")
    );
  };

  return (
    <div
      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
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
          <span className="text-xs text-slate-400 mb-1 ml-1">
            {message.sender.username}
          </span>
        )}

        <div
          className={`px-4 py-2 rounded-2xl
          ${
            isMine
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-slate-800 text-slate-100 rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>

        {/* Time */}
        <span className="text-xs text-slate-600 mt-1 mx-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
