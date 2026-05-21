import { Response } from "express";
import { AuthRequest } from "../types";
import Room from "../models/room.model";
import UnreadMessage from "../models/unread-message.model";

// Get my rooms
export const getMyRooms = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const rooms = await Room.find({ members: req.userId })
      .populate("members", "username isOnline")
      .sort({ updatedAt: -1 });

    const unreadCounts = await UnreadMessage.find({ userId: req.userId });

    const roomsWithUnread = rooms.map((room) => {
      const unread = unreadCounts.find(
        (u) => u.roomId.toString() === room._id.toString(),
      );
      return {
        ...room.toObject(),
        unreadCount: unread ? unread.unreadCount : 0,
      };
    });

    res.json(roomsWithUnread);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create room
export const createRoom = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Room name is required" });
      return;
    }

    const room = await Room.create({
      name: name.trim(),
      members: [req.userId!],
      createdBy: req.userId!,
      isGroup: true,
    });

    await room.populate("members", "username isOnline");

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get or Create 1:1 room
export const getOrCreate1to1Room = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId: otherUserId } = req.body;
    if (!otherUserId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if 1:1 room already exists
    let room = await Room.findOne({
      isGroup: false,
      members: { $all: [req.userId, otherUserId], $size: 2 },
    }).populate("members", "username isOnline");

    if (!room) {
      room = await Room.create({
        members: [req.userId, otherUserId],
        isGroup: false,
        createdBy: req.userId,
      });
      await room.populate("members", "username isOnline");
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add member (Admin only)
export const addMember = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { userId: memberToAddId } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    // Only creator can add members to a group
    if (room.createdBy.toString() !== req.userId) {
      res.status(403).json({ message: "Only room creator can add members" });
      return;
    }

    // Check if already member
    if (room.members.includes(memberToAddId as any)) {
      res.status(400).json({ message: "User is already in this room" });
      return;
    }

    room.members.push(memberToAddId as any);
    await room.save();
    await room.populate("members", "username isOnline");

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove member (Admin only)
export const removeMember = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { roomId, userId: memberToRemoveId } = req.params;
    
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    // Only creator can remove members
    if (room.createdBy.toString() !== req.userId) {
      res.status(403).json({ message: "Only room creator can remove members" });
      return;
    }

    // Cannot remove yourself (you are the admin)
    if (memberToRemoveId === req.userId) {
      res.status(400).json({ message: "Admin cannot be removed" });
      return;
    }

    room.members = room.members.filter(m => m.toString() !== memberToRemoveId);
    await room.save();
    await room.populate("members", "username isOnline");

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
