import { Router } from "express";
import {
  createRoom,
  getMyRooms,
  getOrCreate1to1Room,
  addMember,
  removeMember,
} from "../controllers/room.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

router.get("/", auth, getMyRooms);
router.post("/", auth, createRoom);
router.post("/1to1", auth, getOrCreate1to1Room);
router.post("/:roomId/members", auth, addMember);
router.delete("/:roomId/members/:userId", auth, removeMember);

export default router;
