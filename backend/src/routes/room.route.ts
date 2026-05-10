import { Router } from "express";
import {
  createRoom,
  getMyRooms,
  getPublicRooms,
  joinRoom,
} from "../controllers/room.controller";

const router = Router();

router.get("/", getMyRooms);
router.post("/", createRoom);
router.post("/:roomId/join", joinRoom);
router.get("/browse", getPublicRooms);

export default router;
