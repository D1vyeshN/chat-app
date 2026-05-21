// src/components/chat/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Room } from "@/types";
import { Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types";
import RoomItem from "./RoomItem";
import CreateRoomModal from "./CreateRoomModal";
import StartChatModal from "./StartChatModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Plus, MessageSquarePlus } from "lucide-react";
import BrowseRoomsModal from "./BrowseRoomsModal";
import { useRoomNotifications } from "@/hooks/useRoomNotifications";

interface SidebarProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  selectedRoomId?: string;
  onSelectRoom: (room: Room) => void;
  onUnreadCountChange?: (count: number) => void;
  onRoomsLoaded?: (rooms: Room[]) => void;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export default function Sidebar({
  socket,
  selectedRoomId,
  onSelectRoom,
  onUnreadCountChange,
  onRoomsLoaded,
  rooms,
  setRooms,
}: SidebarProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showStartChat, setShowStartChat] = useState(false);
  const { user, logout } = useAuth();

  // Rooms are already sorted by updatedAt from backend
  // But we might want to re-sort locally when a new message arrives or updatedAt changes
  const sortedRooms = [...rooms].sort((a, b) => 
    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get<Room[]>("/api/rooms");
        setRooms(data);
        onRoomsLoaded?.(data);
      } catch {
        console.error("Failed to fetch rooms");
      }
    };
    fetchRooms();
  }, [setRooms, onRoomsLoaded]);

  useEffect(() => {
    const total = rooms.reduce((acc, room) => acc + (room.unreadCount || 0), 0);
    onUnreadCountChange?.(total);
  }, [rooms, onUnreadCountChange]);

  // Use custom hook for room notifications
  useRoomNotifications({
    socket,
    rooms,
    setRooms,
  });

  const handleSelectRoom = (room: Room) => {
    if (selectedRoomId && socket) {
      socket.emit("leave_room", selectedRoomId);
    }
    if (socket) {
      socket.emit("join_room", room._id);
    }
    
    // Clear unread count locally for immediate feedback
    setRooms((prev) =>
      prev.map((r) =>
        r._id === room._id ? { ...r, unreadCount: undefined } : r
      )
    );
    
    onSelectRoom(room);
  };

  const handleRoomCreated = (room: Room) => {
    setRooms((prev) => [room, ...prev]);
    handleSelectRoom(room);
  };

  const handleChatStarted = (room: Room) => {
    // Check if room already in list
    if (!rooms.find((r) => r._id === room._id)) {
      setRooms((prev) => [room, ...prev]);
    }
    handleSelectRoom(room);
  };

  return (
    <>
      <div className="w-full md:w-64 flex flex-col bg-slate-900 border-r border-slate-800 h-full">
        {/* Sidebar Controls */}
        <div className="flex flex-col gap-2 p-4">
          <Button
            onClick={() => setShowStartChat(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm h-9 gap-2"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreate(true)}
            className="w-full bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-sm h-9 gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>

        <Separator className="bg-slate-800" />

        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Conversations
          </span>
        </div>

        {/* Unified Room List */}
        <ScrollArea suppressHydrationWarning className="flex-1 px-2 overflow-y-auto">
          {sortedRooms.length === 0 ? (
            <p className="text-slate-600 text-xs px-2 py-4 text-center">
              No conversations yet
            </p>
          ) : (
            sortedRooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                isActive={selectedRoomId === room._id}
                onClick={() => handleSelectRoom(room)}
              />
            ))
          )}
        </ScrollArea>

        <Separator className="bg-slate-800" />
      </div>

      {/* Modals */}
      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleRoomCreated}
      />

      <StartChatModal
        open={showStartChat}
        onClose={() => setShowStartChat(false)}
        onChatStarted={handleChatStarted}
      />
    </>
  );
}
