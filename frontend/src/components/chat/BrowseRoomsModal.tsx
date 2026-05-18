// src/components/chat/BrowseRoomsModal.tsx
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";

interface BrowseRoomsModalProps {
  open: boolean;
  onClose: () => void;
  onJoinRoom: (room: Room) => void;
  joinedRoomIds: string[];
}

export default function BrowseRoomsModal({
  open,
  onClose,
  onJoinRoom,
  joinedRoomIds = [],
}: BrowseRoomsModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Room[]>("/api/rooms/browse");
        setRooms(data);
      } catch (error) {
        console.error("Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-md max-h-[80vh] bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-semibold mb-4">Browse Rooms</h2>

        {loading ? (
          <p className="text-slate-400">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-slate-400">No public rooms available</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rooms.map((room) => {
              const isJoined = joinedRoomIds.includes(room._id);
              return (
                <div
                  key={room._id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                >
                  <div>
                    <h3 className="text-white font-medium">{room.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {room.members.length} members
                    </p>
                  </div>
                  <Button
                    onClick={() => onJoinRoom(room)}
                    disabled={isJoined}
                    className={
                      isJoined
                        ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }
                  >
                    {isJoined ? "Joined" : "Join"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full mt-4 text-slate-400 cursor-pointer bg-slate-800 hover:bg-slate-700 hover:text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
