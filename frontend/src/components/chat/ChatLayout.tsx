// src/components/chat/ChatLayout.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useSocket from "@/hooks/useSocket";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import { Room } from "@/types";
import { Hash } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user, token, logout } = useAuth();
  const socket = useSocket(token);

  const roomMembers = selectedRoom?.members
    .map((m) => m.username[0].toUpperCase())
    .slice(0, 4);
  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <div className="h-14 w-full flex items-center justify-between border-b border-slate-800 bg-slate-900">
        {/* App Title */}
        <div className="px-4 py-3 min-h-14 border-b border-slate-800">
          <h1 className="text-white font-bold text-lg">💬 Chat MVP</h1>
        </div>
        {/* User Info */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* <div>
              <p className="text-white text-sm font-medium capitalize">
                {user?.username}
              </p>
              <p className="text-green-400 text-xs">Online</p>
            </div> */}
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-600 text-white text-sm capitalize">
                {user?.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
      <div className="flex h-[calc(100vh-56px)] bg-slate-950">
        {/* Sidebar */}
        <Sidebar
          socket={socket}
          selectedRoomId={selectedRoom?._id}
          onSelectRoom={setSelectedRoom}
        />

        {/* Main Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div
                className="flex items-center gap-2 px-6 
             border-b border-slate-800 bg-slate-900 min-h-14"
              >
                {/* <Hash className="w-5 h-5 text-slate-400" /> */}

                <div className="h-8 w-8 grid grid-cols-2 rounded-full overflow-hidden">
                  {roomMembers?.map((el, i) => (
                    <div
                      key={`el-${i}`}
                      className={`bg-indigo-600 text-white text-[8px] max-h-full ${roomMembers.length === 3 && i === 0 ? "row-span-2 rounded-l-full" : roomMembers.length === 3 && i === 1 ? "row-span-1 rounded-tr-full" : roomMembers.length === 3 && "row-span-1 rounded-br-full"} ${roomMembers.length === 2 && i === 0 ? "rounded-l-full" : roomMembers.length === 2 && i === 1 ? "rounded-r-full" : ""} ${roomMembers.length === 4 && i === 0 ? "rounded-tl-full" : roomMembers.length === 4 && i === 1 ? "rounded-tr-full" : roomMembers.length === 4 && i === 2 ? "rounded-bl-full" : roomMembers.length === 4 && i === 3 ? "rounded-br-full" : ""} border max-w-full flex justify-center items-center`}
                    >
                      {el}
                    </div>
                  ))}
                </div>
                <h2 className="text-white font-semibold capitalize">
                  {selectedRoom.name}
                </h2>
                <span className="text-slate-500 text-sm ml-2">
                  {selectedRoom.members.length} members
                </span>
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
                Select a room to start chatting
              </p>
              <p className="text-slate-600 text-sm">or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
