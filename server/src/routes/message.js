import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMessagesByRoom,
  getInbox,
  archiveRoom,
  getUnreadTotal,
} from "../controllers/message.js";

const messageRouter = express.Router();

messageRouter.get("/inbox", authenticate, getInbox);
messageRouter.get("/unread-total", authenticate, getUnreadTotal);
messageRouter.post("/archive/:room", authenticate, archiveRoom);
messageRouter.get("/:room", authenticate, getMessagesByRoom);

export default messageRouter;
