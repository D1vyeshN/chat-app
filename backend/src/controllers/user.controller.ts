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

export const getRecommendedUsers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId },
    })
      .select("username isOnline")
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
