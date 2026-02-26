import express from "express";
import { authenticate } from "../middleware/auth.js";

import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotifications,
} from "../controllers/notification.js";

const router = express.Router();

// Main notifications routes
router.get("/", authenticate, getMyNotifications);
router.get("/all", authenticate, getNotifications); // optional if you want both endpoints
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/read-all", authenticate, markAllAsRead);
router.patch("/:id/read", authenticate, markAsRead);

export default router;
