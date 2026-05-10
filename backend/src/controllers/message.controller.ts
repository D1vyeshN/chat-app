import { Response } from "express";
import { AuthRequest } from "../types";
import Message from "../models/message.model";

// Get room messages
export const getRoomMessages = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.roomId;

    const messages = await Message.find({ roomId })
      .populate("sender", "username")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
