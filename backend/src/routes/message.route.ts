import { Router } from "express";
import { getRoomMessages } from "../controllers/message.controller";

const router = Router();

router.get("/:roomId", getRoomMessages);

export default router;
