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
import api from "@/lib/axios";
import { User, Room } from "@/types";
import { Search, Loader2 } from "lucide-react";

interface StartChatModalProps {
  open: boolean;
  onClose: () => void;
  onChatStarted: (room: Room) => void;
}

export default function StartChatModal({
  open,
  onClose,
  onChatStarted,
}: StartChatModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<User[]>("/api/users/recommended");
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    if (open && !query) {
      fetchRecommended();
    }
  }, [open, query]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) return;
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

  const handleStartChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      const { data } = await api.post<Room>("/api/rooms/1to1", { userId });
      onChatStarted(data);
      onClose();
    } catch (error) {
      console.error("Failed to start chat");
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white focus-visible:ring-indigo-500"
          />
        </div>
        <ScrollArea className="h-72 mt-4 pr-4">
          {loading && !users.length ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-500 mt-10">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-indigo-600">
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-slate-400">
                        {user.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartChat(user._id)}
                    disabled={startingChat === user._id}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {startingChat === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Chat"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
