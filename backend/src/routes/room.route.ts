import { Router } from "express";
import {
  createRoom,
  getMyRooms,
  getPublicRooms,
  joinRoom,
} from "../controllers/room.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

router.get("/", auth, getMyRooms);
router.post("/", auth, createRoom);
router.post("/:roomId/join", auth, joinRoom);
router.get("/browse", auth, getPublicRooms);

export default router;
