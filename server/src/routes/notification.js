import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getNotifications } from "../controllers/notification.js";

const router = express.Router();

router.get("/", authenticate, getNotifications);

export default router;
