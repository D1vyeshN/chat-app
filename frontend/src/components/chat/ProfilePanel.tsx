"use client";

import { useState } from "react";
import { User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Loader2, Camera, X, LogOut } from "lucide-react";

interface ProfilePanelProps {
  onClose: () => void;
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { user, setUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await api.put("/api/users/profile", formData);
      setUser(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-4 py-2 flex items-center justify-between">
        <h3 className="text-white font-semibold">My Profile</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-2 ring-indigo-600 ring-offset-4 ring-offset-slate-900">
              <AvatarFallback className="bg-slate-800 text-2xl text-white">
                {user?.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <h4 className="text-white text-lg font-bold mt-4 capitalize">
            {user?.username}
          </h4>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-400">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-400">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="bg-slate-800 border-slate-700 text-white resize-none"
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-transparent border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bio
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {user?.bio || "No bio yet."}
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="w-full bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="w-full text-slate-600 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
