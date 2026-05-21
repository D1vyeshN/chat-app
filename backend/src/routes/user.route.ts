import { Router } from "express";
import { searchUsers, updateProfile } from "../controllers/user.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

router.use(auth);

router.get("/search", searchUsers);
router.put("/profile", updateProfile);

export default router;
