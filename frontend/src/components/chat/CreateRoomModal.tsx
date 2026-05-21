"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { User, Room } from "@/types";
import { Search, Loader2, X, Check } from "lucide-react";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (room: Room) => void;
}

export default function CreateRoomModal({
  open,
  onClose,
  onCreated,
}: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get<User[]>(`/api/users/search?query=${query}`);
        setUsers(data);
      } catch (error) {
        console.error("Failed to search users");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedUsers.length < 2) return;

    setCreating(true);
    try {
      const { data } = await api.post<Room>("/api/rooms", {
        name: name.trim(),
        members: selectedUsers.map((u) => u._id),
      });
      onCreated(data);
      handleClose();
    } catch (error: any) {
      console.error("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setQuery("");
    setSelectedUsers([]);
    setUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-slate-900 text-white border-slate-800 flex flex-col h-[80vh] max-h-[600px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 pt-2 space-y-4 flex flex-col flex-1 overflow-hidden">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400">Group Name</Label>
              <Input
                id="name"
                placeholder="Marketing Team, Weekend Trip..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white focus-visible:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-2 flex flex-col flex-1 overflow-hidden">
              <Label className="text-slate-400">Add Members (At least 2)</Label>
              
              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-slate-800/50 rounded-lg max-h-24 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-1.5 bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded-md text-xs border border-indigo-600/30"
                    >
                      <span className="capitalize">{user.username}</span>
                      <button
                        type="button"
                        onClick={() => toggleUser(user)}
                        className="hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search users to add..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white focus-visible:ring-indigo-500"
                />
              </div>

              <ScrollArea className="flex-1 mt-2 pr-4 border border-slate-800 rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  </div>
                ) : users.length === 0 && query.trim() ? (
                  <p className="text-center text-slate-500 py-10 text-sm">No users found</p>
                ) : users.length === 0 ? (
                   <p className="text-center text-slate-500 py-10 text-xs italic">Start typing to find users</p>
                ) : (
                  <div className="p-2 space-y-1">
                    {users.map((user) => {
                      const isSelected = !!selectedUsers.find((u) => u._id === user._id);
                      return (
                        <div
                          key={user._id}
                          onClick={() => toggleUser(user)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "bg-indigo-600/10 border border-indigo-600/20" : "hover:bg-slate-800 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-slate-700 text-xs">
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium capitalize">{user.username}</p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-indigo-500" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="p-6 pt-2 border-t border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-transparent border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !name.trim() || selectedUsers.length < 2}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
