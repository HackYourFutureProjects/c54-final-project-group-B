// server/routes/notifications.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createReviewAndNotify,
  giveAccessAndNotify,
} from "../controllers/notifications.js";

const router = express.Router();

// 3 - شخص قام بمراجعتك
router.post("/review", authenticate, createReviewAndNotify);

// 4 - شخص أعطاك حق الوصول لمراجعة قائمته
router.post("/access", authenticate, giveAccessAndNotify);

export default router;
