import { Response } from "express";
import { AuthRequest } from "../types";
import Room from "../models/room.model";

// Get my rooms
export const getMyRooms = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const rooms = await Room.find({ members: req.userId })
      .populate("members", "username isOnline")
      .sort({ updatedAt: -1 });
    res.json(rooms);
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
    });

    await room.populate("members", "username isOnline");

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// join room
export const joinRoom = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    // Check already member
    if (room.members.includes(req.userId as any)) {
      res.status(400).json({ message: "You are already in this room" });
      return;
    }
    room.members.push(req.userId as any);
    await room.save();
    await room.populate("members", "username isOnline");

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all public rooms (to browse and join)
export const getPublicRooms = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const rooms = await Room.find()
      .populate("members", "username isOnline")
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
