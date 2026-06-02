import { Response } from "express";
import { AuthRequest } from "../types";
import Message from "../models/message.model";
import Room from "../models/room.model";

// Get room messages with pagination
export const getRoomMessages = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.roomId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check membership
    const room = await Room.findById(roomId);
    if (!room || !room.members.includes(req.userId as any)) {
      res.status(403).json({ message: "Access denied: Not a member of this room" });
      return;
    }

    const messages = await Message.find({ roomId })
      .populate("sender", "username")
      .sort({ createdAt: -1 }) // Latest first for easier infinite scroll logic
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ roomId });
    const hasMore = totalMessages > page * limit;

    // Reverse to send in chronological order if preferred, or just let frontend handle it
    // For infinite scroll scrolling UP, it might be easier to send latest first
    // but usually frontend expects chronological order.
    // Let's send them latest first, but the frontend will reverse them or append to top.
    
    res.json({
      messages, // Send in newest-first order
      hasMore,
      totalMessages
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update message
export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (message.sender.toString() !== req.userId) {
      res.status(403).json({ message: "Access denied: Not your message" });
      return;
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const populatedMessage = await message.populate("sender", "username");

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (message.sender.toString() !== req.userId) {
      res.status(403).json({ message: "Access denied: Not your message" });
      return;
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: "Message deleted successfully", messageId });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
