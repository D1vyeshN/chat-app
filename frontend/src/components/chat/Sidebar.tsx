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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Plus } from "lucide-react";
import BrowseRoomsModal from "./BrowseRoomsModal";
import { useRoomNotifications } from "@/hooks/useRoomNotifications";

interface SidebarProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  selectedRoomId?: string;
  onSelectRoom: (room: Room) => void;
}

export default function Sidebar({
  socket,
  selectedRoomId,
  onSelectRoom,
}: SidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const { user, logout } = useAuth();
  const [showBrowse, setShowBrowse] = useState(false);

  const handleJoinRoom = async (room: Room) => {
    try {
      await api.post(`/api/rooms/${room._id}/join`);
      setRooms((prev) => [room, ...prev]);
      handleSelectRoom(room);
      setShowBrowse(false);
    } catch (error: any) {
      console.error("Failed to join room:", error.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get<Room[]>("/api/rooms");
        setRooms(data);
      } catch {
        console.error("Failed to fetch rooms");
      }
    };
    fetchRooms();
  }, []);

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

  return (
    <>
      <div className="w-64 flex flex-col bg-slate-900 border-r border-slate-800">
        {/* App Title */}
        <div className="px-4 py-5 border-b border-slate-800">
          <h1 className="text-white font-bold text-lg">💬 Chat MVP</h1>
        </div>

        {/* Rooms Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Rooms
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCreate(true)}
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Room List */}
        <ScrollArea suppressHydrationWarning className="flex-1 px-2">
          {rooms.length === 0 ? (
            <p className="text-slate-600 text-sm px-2 py-4 text-center">
              No rooms yet
            </p>
          ) : (
            rooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                isActive={selectedRoomId === room._id}
                onClick={() => handleSelectRoom(room)}
              />
            ))
          )}
        </ScrollArea>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setShowBrowse(true)}
          className="text-slate-400 mb-2 rounded-md! cursor-pointer hover:text-white hover:bg-slate-800"
        >
          Browse Rooms
        </Button>
        <Separator className="bg-slate-800" />

        {/* User Info */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-600 text-white text-sm">
                {user?.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-green-400 text-xs">Online</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-slate-400 hover:text-red-400
             hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleRoomCreated}
      />

      <BrowseRoomsModal
        open={showBrowse}
        onClose={() => setShowBrowse(false)}
        onJoinRoom={handleJoinRoom}
        joinedRoomIds={rooms.map((room) => room._id)}
      />
    </>
  );
}
