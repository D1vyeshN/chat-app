import { useEffect } from "react";
import { SOCKET_EVENTS } from "@/socket/socket-events";
import { Room, Message } from "@/types";

interface UseRoomNotificationsProps {
  socket: any;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const useRoomNotifications = ({
  socket,
  rooms,
  setRooms,
}: UseRoomNotificationsProps) => {
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      setRooms((prev) =>
        prev.map((room) =>
          room._id === message.roomId
            ? { ...room, updatedAt: new Date() }
            : room
        )
      );
    };

    const handleRoomNotification = (data: {
      roomId: string;
      roomName: string;
      unreadCount: number;
      lastMessage: string;
    }) => {
      setRooms((prev) =>
        prev.map((room) =>
          room._id === data.roomId
            ? { ...room, unreadCount: data.unreadCount, updatedAt: new Date() }
            : room
        )
      );
    };

    const handleUnreadCountUpdated = (data: {
      roomId: string;
      unreadCount: number;
    }) => {
      setRooms((prev) =>
        prev.map((room) =>
          room._id === data.roomId
            ? { ...room, unreadCount: data.unreadCount }
            : room
        )
      );
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    socket.on(SOCKET_EVENTS.ROOM_NOTIFICATION, handleRoomNotification);
    socket.on(SOCKET_EVENTS.UNREAD_COUNT_UPDATED, handleUnreadCountUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.ROOM_NOTIFICATION, handleRoomNotification);
      socket.off(SOCKET_EVENTS.UNREAD_COUNT_UPDATED, handleUnreadCountUpdated);
    };
  }, [socket, setRooms]);
};
