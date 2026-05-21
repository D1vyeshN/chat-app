"use client";

import { Room, User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import {
  X,
  LogOut,
  Shield,
  Users,
  Trash2,
  Edit2,
  Check,
  UserPlus,
  Search,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";

interface InfoPanelProps {
  room: Room;
  onClose: () => void;
  onRoomUpdate: (room: Room | null) => void;
}

export default function InfoPanel({
  room,
  onClose,
  onRoomUpdate,
}: InfoPanelProps) {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(room.name || "");
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const isAdmin = room.createdBy === currentUser?._id;

  const otherUser = room.isGroup
    ? null
    : room.members.find((m) => m._id !== currentUser?._id);

  const displayName = room.isGroup
    ? room.name
    : otherUser?.username || "Unknown User";

  const roomMembers = room.members
    .map((m) => m.username[0].toUpperCase())
    .slice(0, 4);

  useEffect(() => {
    if (showAddMember && searchQuery.trim()) {
      const search = async () => {
        setSearching(true);
        try {
          const { data } = await api.get<User[]>(
            `/api/users/search?query=${searchQuery}`,
          );
          // Filter out users already in room
          setFoundUsers(
            data.filter((u) => !room.members.find((m) => m._id === u._id)),
          );
        } catch (error) {
          console.error("Search failed");
        } finally {
          setSearching(false);
        }
      };
      const timeout = setTimeout(search, 300);
      return () => clearTimeout(timeout);
    } else {
      setFoundUsers([]);
    }
  }, [searchQuery, showAddMember, room.members]);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === room.name) {
      setIsEditingName(false);
      return;
    }
    try {
      const { data } = await api.put(`/api/rooms/${room._id}`, {
        name: newName.trim(),
      });
      onRoomUpdate(data);
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name");
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const { data } = await api.post(`/api/rooms/${room._id}/members`, {
        userId,
      });
      onRoomUpdate(data);
      setShowAddMember(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to add member");
    }
  };

  const handleExitGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    setLoading(true);
    try {
      await api.post(`/api/rooms/${room._id}/exit`);
      onRoomUpdate(null);
      onClose();
    } catch (error) {
      console.error("Failed to exit group");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      const { data } = await api.delete(
        `/api/rooms/${room._id}/members/${memberId}`,
      );
      onRoomUpdate(data);
    } catch (error) {
      console.error("Failed to remove member");
    }
  };

  return (
    <div className="w-full  h-full bg-slate-900 border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-semibold">
          {room.isGroup ? "Group Info" : "User Info"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex flex-col items-center mb-8">
            {room.isGroup ? (
              <div className="h-24 w-24 grid grid-cols-2 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-800 ring-offset-4 ring-offset-slate-900 mb-4">
                {roomMembers.map((el, i) => (
                  <div
                    key={`eles-${i}`}
                    className={`bg-indigo-600 text-white text-2xl font-bold capitalize ${
                      roomMembers.length === 3 && i === 0 ? "row-span-2" : ""
                    } border-slate-900 border-[0.5px] flex justify-center items-center`}
                  >
                    {el}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 rounded-full ring-2 ring-slate-800 ring-offset-4 ring-offset-slate-900 mb-4">
                  <AvatarFallback className="bg-indigo-600 rounded-full text-2xl font-bold text-white capitalize">
                    {displayName?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {otherUser?.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                )}
              </div>
            )}

            {isEditingName ? (
              <div className="flex items-center gap-2 w-full max-w-[200px]">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-800 border-slate-700 h-8 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateName}
                  className="h-8 w-8 text-green-500"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingName(false)}
                  className="h-8 w-8 text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="text-white text-xl font-bold capitalize">
                  {displayName}
                </h4>
                {room.isGroup && isAdmin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="h-6 w-6 text-slate-500 hover:text-white"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {!room.isGroup && otherUser?.isOnline && (
              <span className="text-green-400 text-xs font-medium mt-1">
                Online
              </span>
            )}
            {room.isGroup && (
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">
                {room.members.length} Members
              </span>
            )}
          </div>

          {!room.isGroup && otherUser && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Bio
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {otherUser.bio || "No bio yet."}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {otherUser.email}
                </p>
              </div>
            </div>
          )}

          {room.isGroup && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Members
                  </p>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddMember(!showAddMember)}
                      className="h-7 text-xs text-indigo-400 hover:text-indigo-300 gap-1.5"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add
                    </Button>
                  )}
                </div>

                {showAddMember && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                      <Input
                        placeholder="Find users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-800 border-slate-700 h-8 pl-7 text-xs"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 rounded-full border border-slate-800 p-1">
                      {searching ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                        </div>
                      ) : foundUsers.length === 0 ? (
                        <p className="text-[10px] text-slate-600 text-center py-2">
                          No users found
                        </p>
                      ) : (
                        foundUsers.map((u) => (
                          <button
                            key={u._id}
                            onClick={() => handleAddMember(u._id)}
                            className="w-full flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-800 transition-colors text-left"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-slate-700">
                                {u.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-300 capitalize">
                              {u.username}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {room.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8 rounded-full">
                            <AvatarFallback className="bg-slate-800 rounded-full text-xs font-bold text-white uppercase">
                              {member.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          {member.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-300 font-medium capitalize flex items-center gap-1.5">
                            {member.username}
                            {member._id === room.createdBy && (
                              <Badge
                                variant="outline"
                                className="text-indigo-500"
                              >
                                Admin
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      {isAdmin && member._id !== currentUser?._id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member._id)}
                          className="h-7 w-7 text-slate-600 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button
                  variant="ghost"
                  onClick={handleExitGroup}
                  disabled={loading}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Exit Group
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
