import { Router } from "express";
import { searchUsers, getRecommendedUsers } from "../controllers/user.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

router.use(auth);

router.get("/search", searchUsers);
router.get("/recommended", getRecommendedUsers);

export default router;
