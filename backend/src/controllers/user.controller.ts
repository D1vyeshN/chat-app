import { Response } from "express";
import { AuthRequest } from "../types";
import User from "../models/user.model";

export const searchUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { query } = req.query;
    const users = await User.find({
      _id: { $ne: req.userId },
      username: { $regex: query as string, $options: "i" },
    })
      .select("username isOnline")
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      isOnline: user.isOnline,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
