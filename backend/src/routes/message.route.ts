import { Router } from "express";
import { getRoomMessages, updateMessage, deleteMessage } from "../controllers/message.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

router.get("/:roomId", auth, getRoomMessages);
router.patch("/:messageId", auth, updateMessage);
router.delete("/:messageId", auth, deleteMessage);

export default router;
