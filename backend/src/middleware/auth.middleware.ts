import { AuthRequest, JwtPayload } from "../types";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
