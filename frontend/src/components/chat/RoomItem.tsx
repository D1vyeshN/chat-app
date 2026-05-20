"use client";
// src/components/chat/RoomItem.tsx
import { Room } from "@/types";
import { Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RoomItemProps {
  room: Room;
  isActive: boolean;
  onClick: () => void;
}

export default function RoomItem({ room, isActive, onClick }: RoomItemProps) {
  const [unreadCount, setUnreadCount] = useState(room.unreadCount);
  const onlineCount = room.members.filter((m) => m.isOnline).length;
  const roomMembers = room.members
    .map((m) => m.username[0].toUpperCase())
    .slice(0, 4);

  useEffect(() => {
    if (room.unreadCount) {
      setUnreadCount(room.unreadCount);
    } else {
      setUnreadCount(undefined);
    }
  }, [room.unreadCount]);

  console.log(room.unreadCount);
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md
        text-left transition-colors mb-0.5
        ${
          isActive
            ? "bg-slate-700 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        }`}
    >
      {/* <Hash className="h-4 w-4 shrink-0" /> */}

      <div className="h-8 w-8 grid grid-cols-2 rounded-full overflow-hidden">
        {roomMembers.map((el, i) => (
          <div
            key={`el-${i}`}
            className={`bg-indigo-600 text-white text-[8px] max-h-full ${roomMembers.length === 3 && i === 0 ? "row-span-2 rounded-l-full" : roomMembers.length === 3 && i === 1 ? "row-span-1 rounded-tr-full" : roomMembers.length === 3 && "row-span-1 rounded-br-full"} ${roomMembers.length === 2 && i === 0 ? "rounded-l-full" : roomMembers.length === 2 && i === 1 ? "rounded-r-full" : ""} ${roomMembers.length === 4 && i === 0 ? "rounded-tl-full" : roomMembers.length === 4 && i === 1 ? "rounded-tr-full" : roomMembers.length === 4 && i === 2 ? "rounded-bl-full" : roomMembers.length === 4 && i === 3 ? "rounded-br-full" : ""} border max-w-full flex justify-center items-center`}
          >
            {el}
          </div>
        ))}
      </div>
      <span className="flex-1 text-sm truncate capitalize">{room.name}</span>
      <div className="flex items-center gap-2">
        {unreadCount && unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {/* {onlineCount > 0 && (
          <span className="text-xs text-green-400">{onlineCount}</span>
        )} */}
      </div>
    </button>
  );
}
