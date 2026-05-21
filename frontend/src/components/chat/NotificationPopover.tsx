"use client";

import { Room } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface NotificationPopoverProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onClose: () => void;
}

export default function NotificationPopover({
  rooms,
  onSelectRoom,
  onClose,
}: NotificationPopoverProps) {
  const roomsWithUnread = rooms
    .filter((r) => (r.unreadCount || 0) > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="absolute top-12 right-0 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-white font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 text-slate-500 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-[400px]">
        {roomsWithUnread.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {roomsWithUnread.map((room) => (
              <button
                key={room._id}
                onClick={() => {
                  onSelectRoom(room);
                  onClose();
                }}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-left group"
              >
                <Avatar className="h-10 w-10 rounded-lg shrink-0">
                  <AvatarFallback className="bg-indigo-600 rounded-lg text-sm font-bold text-white uppercase">
                    {(room.name || "U")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {room.isGroup ? room.name : room.members.find(m => m.username !== "self")?.username || "Private Chat"}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    You have <span className="text-indigo-400 font-bold">{room.unreadCount}</span> unread messages
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
