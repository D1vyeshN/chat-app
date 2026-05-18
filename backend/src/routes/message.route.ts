import { Router } from "express";
import { getRoomMessages } from "../controllers/message.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

router.get("/:roomId", auth, getRoomMessages);

export default router;
