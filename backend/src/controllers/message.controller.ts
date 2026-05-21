import { Response } from "express";
import { AuthRequest } from "../types";
import Message from "../models/message.model";
import Room from "../models/room.model";

// Get room messages
export const getRoomMessages = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.roomId;

    // Check membership
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(req.userId as any)) {
      res.status(403).json({ message: "Access denied: Not a member of this room" });
      return;
    }

    const messages = await Message.find({ roomId })
      .populate("sender", "username")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
