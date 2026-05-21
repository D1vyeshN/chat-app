// src/components/chat/ChatLayout.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useSocket from "@/hooks/useSocket";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import { Room } from "@/types";
import { Hash, UserPlus, LogOut, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import StartChatModal from "./StartChatModal";
import api from "@/lib/axios";

export default function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { user, token, logout } = useAuth();
  const socket = useSocket(token);

  const isAdmin = selectedRoom?.createdBy === user?._id;

  const otherUser = selectedRoom?.isGroup 
    ? null 
    : selectedRoom?.members.find((m) => m._id !== user?._id);
  
  const displayName = selectedRoom?.isGroup 
    ? selectedRoom.name 
    : (otherUser?.username || "Unknown User");

  const roomMembers = selectedRoom?.members
    .map((m) => m.username[0].toUpperCase())
    .slice(0, 4);

  const handleAddMember = async (targetUser: any) => {
    if (!selectedRoom) return;
    try {
      const { data } = await api.post(`/api/rooms/${selectedRoom._id}/members`, {
        userId: targetUser._id
      });
      setSelectedRoom(data);
      setShowAddMember(false);
    } catch (error) {
      console.error("Failed to add member");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <div className="h-14 w-full flex items-center justify-between border-b border-slate-800 bg-slate-900">
        {/* App Title */}
        <div className="px-4 py-3 min-h-14 border-b border-slate-800">
          <h1 className="text-white font-bold text-lg">💬 Chat MVP</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 min-h-14 border-b border-slate-800 flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search messages..."
            className="w-full bg-slate-800 text-white px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 px-4">
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-400 cursor-pointer hover:text-white" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </div>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4 py-2">
            <div className="text-right hidden sm:block">
              <p className="text-white text-xs font-medium capitalize leading-none mb-1">
                {user?.username}
              </p>
            </div>
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-600 text-white text-sm capitalize">
                  {user?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
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
      </div>
      <div className="flex h-[calc(100vh-56px)] bg-slate-950">
        {/* Sidebar */}
        <Sidebar
          socket={socket}
          selectedRoomId={selectedRoom?._id}
          onSelectRoom={setSelectedRoom}
          onUnreadCountChange={setTotalUnreadCount}
        />

        {/* Main Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 
             border-b border-slate-800 bg-slate-900 min-h-14"
              >
                <div className="flex items-center gap-3">
                  {selectedRoom.isGroup ? (
                    <div className="h-8 w-8 grid grid-cols-2 rounded-full overflow-hidden shrink-0">
                      {roomMembers?.map((el, i) => (
                        <div
                          key={`el-${i}`}
                          className={`bg-indigo-600 text-white text-[8px] max-h-full ${
                            roomMembers.length === 3 && i === 0 
                              ? "row-span-2 rounded-l-full" 
                              : roomMembers.length === 3 && i === 1 
                              ? "row-span-1 rounded-tr-full" 
                              : roomMembers.length === 3 
                              ? "row-span-1 rounded-br-full" 
                              : ""
                          } ${
                            roomMembers.length === 2 && i === 0 
                              ? "rounded-l-full" 
                              : roomMembers.length === 2 && i === 1 
                              ? "rounded-r-full" 
                              : ""
                          } ${
                            roomMembers.length === 4 && i === 0 
                              ? "rounded-tl-full" 
                              : roomMembers.length === 4 && i === 1 
                              ? "rounded-tr-full" 
                              : roomMembers.length === 4 && i === 2 
                              ? "rounded-bl-full" 
                              : roomMembers.length === 4 && i === 3 
                              ? "rounded-br-full" 
                              : ""
                          } border max-w-full flex justify-center items-center`}
                        >
                          {el}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-600 text-sm text-white capitalize">
                          {displayName?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {otherUser?.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                  )}

                  <div>
                    <h2 className="text-white font-semibold capitalize leading-none">
                      {displayName}
                    </h2>
                    {selectedRoom.isGroup && (
                      <p className="text-slate-500 text-xs mt-1">
                        {selectedRoom.members.length} members
                      </p>
                    )}
                  </div>
                </div>

                {selectedRoom.isGroup && isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddMember(true)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                )}
              </div>

              {/* Messages */}
              <MessageList
                socket={socket}
                room={selectedRoom}
                currentUser={user!}
              />
            </>
          ) : (
            // No room selected
            <div
              className="flex flex-col items-center justify-center
           flex-1 gap-3"
            >
              <div
                className="w-16 h-16 rounded-full bg-slate-800
             flex items-center justify-center"
              >
                <Hash className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>

      <StartChatModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onChatStarted={handleAddMember}
      />
    </div>
  );
}
