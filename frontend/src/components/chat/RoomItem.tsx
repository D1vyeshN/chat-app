"use client";
// src/components/chat/RoomItem.tsx
import { Room } from "@/types";
import { Hash, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface RoomItemProps {
  room: Room;
  isActive: boolean;
  onClick: () => void;
}

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d`;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h`;
  
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes > 0) return `${minutes}m`;
  
  return "now";
};

export default function RoomItem({ room, isActive, onClick }: RoomItemProps) {
  const [unreadCount, setUnreadCount] = useState(room.unreadCount);
  const { user: currentUser } = useAuth();
  
  const otherUser = room.isGroup 
    ? null 
    : room.members.find((m) => m._id !== currentUser?._id);
  
  const displayName = room.isGroup 
    ? room.name 
    : (otherUser?.username || "Unknown User");

  const roomMembers = room.members
    .map((m) => m.username[0].toUpperCase())
    .slice(0, 4);

  const time = room.updatedAt || room.createdAt;

  useEffect(() => {
    if (room.unreadCount) {
      setUnreadCount(room.unreadCount);
    } else {
      setUnreadCount(undefined);
    }
  }, [room.unreadCount]);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg
        text-left transition-all mb-1
        ${
          isActive
            ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        }`}
    >
      {room.isGroup ? (
        <div className="h-10 w-10 grid grid-cols-2 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-800">
          {roomMembers.map((el, i) => (
            <div
              key={`el-${i}`}
              className={`bg-indigo-600/80 text-white text-[10px] font-bold ${
                roomMembers.length === 3 && i === 0 
                  ? "row-span-2" 
                  : ""
              } border-slate-900 border-[0.5px] flex justify-center items-center`}
            >
              {el}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarFallback className="bg-indigo-600 rounded-lg text-sm font-bold text-white">
              {displayName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {otherUser?.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate capitalize">
            {displayName}
          </span>
          {time && (
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              {formatTime(new Date(time))}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 truncate">
            {room.isGroup ? `${room.members.length} members` : ""}
          </p>
          {unreadCount && unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
