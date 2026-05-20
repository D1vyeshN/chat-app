// src/components/chat/ChatLayout.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useSocket from "@/hooks/useSocket";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import { Room } from "@/types";
import { Hash } from "lucide-react";

export default function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user, token } = useAuth();
  const socket = useSocket(token);

  const roomMembers = selectedRoom?.members
    .map((m) => m.username[0].toUpperCase())
    .slice(0, 4);
  return (
    <div className="flex h-screen bg-slate-950">
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
              className="flex items-center gap-2 px-6 py-[22px]
             border-b border-slate-800 bg-slate-900 min-h-"
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
  );
}
