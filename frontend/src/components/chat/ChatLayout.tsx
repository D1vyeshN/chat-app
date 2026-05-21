// src/components/chat/ChatLayout.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import useSocket from "@/hooks/useSocket";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import { Room } from "@/types";
import { Hash, UserPlus, LogOut, Bell, MoreVertical, ChevronLeft, Plus, MessageSquarePlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import StartChatModal from "./StartChatModal";
import CreateRoomModal from "./CreateRoomModal";
import NotificationPopover from "./NotificationPopover";
import ProfilePanel from "./ProfilePanel";
import InfoPanel from "./InfoPanel";
import api from "@/lib/axios";

type ViewState = "LIST" | "CHAT" | "MY_PROFILE" | "CHAT_INFO";

export default function ChatLayout() {
  const [viewState, setViewState] = useState<ViewState>("LIST");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  const { user, token, logout } = useAuth();
  const socket = useSocket(token);

  // Handle screen resize to determine layout mode
  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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
      setRooms(prev => prev.map(r => r._id === data._id ? data : r));
      setShowAddMember(false);
    } catch (error) {
      console.error("Failed to add member");
    }
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setViewState("CHAT");
  };

  const goBack = () => {
    if (viewState === "CHAT_INFO") setViewState("CHAT");
    else if (viewState === "CHAT") setViewState("LIST");
    else if (viewState === "MY_PROFILE") setViewState("LIST");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="h-14 w-full flex items-center justify-between border-b border-slate-800 bg-slate-900 z-30 shrink-0">
        <div className="flex items-center">
          {!isLargeScreen && viewState !== "LIST" && (
            <Button variant="ghost" size="icon" onClick={goBack} className="ml-2 text-slate-400">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <div className="px-4 py-3">
            <h1 className="text-white font-bold text-lg">💬 Chat MVP</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
          {/* Desktop Only Actions */}
          {isLargeScreen && (
            <div className="flex items-center gap-2 mr-2">
              <Button
                size="sm"
                onClick={() => setShowNewChat(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs h-8 gap-2"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                New Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateGroup(true)}
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-8 gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Group
              </Button>
            </div>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-slate-400 hover:text-white relative"
            >
              <Bell className="h-5 w-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
            {showNotifications && (
              <NotificationPopover
                rooms={rooms}
                onSelectRoom={handleSelectRoom}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-2 sm:pl-4">
            <div 
              className="relative cursor-pointer group"
              onClick={() => setViewState(isLargeScreen && viewState === "MY_PROFILE" ? (selectedRoom ? "CHAT" : "LIST") : "MY_PROFILE")}
            >
              <Avatar className={`h-8 w-8 ring-2 transition-all ${viewState === "MY_PROFILE" ? 'ring-indigo-500' : 'ring-transparent'}`}>
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
              className="h-8 w-8 text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar (List View) */}
        {(isLargeScreen || viewState === "LIST") && (
          <div className={`${isLargeScreen ? 'w-80 border-r border-slate-800' : 'w-full'} h-full shrink-0 z-20 relative`}>
            <Sidebar
              socket={socket}
              selectedRoomId={selectedRoom?._id}
              onSelectRoom={handleSelectRoom}
              onUnreadCountChange={setTotalUnreadCount}
              rooms={rooms}
              setRooms={setRooms}
            />
            {/* Mobile Floating Action Button */}
            {!isLargeScreen && viewState === "LIST" && (
               <Button
                 onClick={() => setShowNewChat(true)}
                 className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-2xl z-30"
               >
                 <Plus className="h-6 w-6" />
               </Button>
            )}
          </div>
        )}

        {/* Chat UI & Right Panels Container */}
        {(isLargeScreen || viewState === "CHAT" || viewState === "CHAT_INFO" || (viewState === "MY_PROFILE" && !isLargeScreen)) && (
          <div className={`flex flex-1 overflow-hidden bg-slate-950 ${!isLargeScreen && viewState === "LIST" ? "hidden" : "flex"}`}>
            
            {/* Chat Area */}
            <div className={`flex flex-col flex-1 min-w-0 border-r border-slate-800/50 ${!isLargeScreen && (viewState === "CHAT_INFO" || viewState === "MY_PROFILE") ? "hidden" : "flex"}`}>
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 bg-slate-900 min-h-14 shrink-0">
                    <div className="flex items-center gap-3">
                      {selectedRoom.isGroup ? (
                        <div className="h-8 w-8 grid grid-cols-2 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-800">
                          {roomMembers?.map((el, i) => (
                            <div key={i} className="bg-indigo-600/80 text-white text-[8px] font-bold border-slate-900 border-[0.5px] flex justify-center items-center">
                              {el}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative shrink-0">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="bg-indigo-600 rounded-lg text-sm text-white capitalize">
                              {displayName?.[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {otherUser?.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                          )}
                        </div>
                      )}
                      <div>
                        <h2 className="text-white font-semibold capitalize leading-none text-sm sm:text-base">{displayName}</h2>
                        {selectedRoom.isGroup && <p className="text-slate-500 text-[10px] sm:text-xs mt-1">{selectedRoom.members.length} members</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {selectedRoom.isGroup && isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => setShowAddMember(true)} className="text-slate-400 hover:text-white md:px-3 md:w-auto gap-2">
                          <UserPlus className="h-4 w-4" />
                          <span className="hidden md:inline text-xs">Add</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewState(viewState === "CHAT_INFO" ? "CHAT" : "CHAT_INFO")}
                        className={`text-slate-400 hover:text-white ${viewState === "CHAT_INFO" ? 'bg-slate-800 text-white' : ''}`}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0">
                    <MessageList socket={socket} room={selectedRoom} currentUser={user!} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 p-4 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-xl">
                    <Hash className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-slate-300 text-lg font-medium">Select a conversation</p>
                </div>
              )}
            </div>

            {/* Right Panels (Info/MyProfile) */}
            <div className={`
              ${isLargeScreen ? 'w-80 block' : (viewState === "CHAT_INFO" || viewState === "MY_PROFILE" ? 'w-full' : 'hidden')}
              h-full shrink-0
            `}>
              {viewState === "CHAT_INFO" && selectedRoom && (
                <InfoPanel
                  room={selectedRoom}
                  onClose={() => setViewState("CHAT")}
                  onRoomUpdate={(updated) => {
                    if (!updated) {
                      setSelectedRoom(null);
                      setRooms(prev => prev.filter(r => r._id !== selectedRoom._id));
                      setViewState("LIST");
                    } else {
                      setSelectedRoom(updated);
                      setRooms(prev => prev.map(r => r._id === updated._id ? updated : r));
                    }
                  }}
                />
              )}
              {viewState === "MY_PROFILE" && (
                <ProfilePanel onClose={() => {
                  if (isLargeScreen) setViewState(selectedRoom ? "CHAT" : "LIST");
                  else goBack();
                }} />
              )}
            </div>
          </div>
        )}
      </div>

      <StartChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChatStarted={handleSelectRoom}
      />
      <CreateRoomModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreated={handleSelectRoom}
      />
      <StartChatModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onChatStarted={handleAddMember}
      />
    </div>
  );
}
