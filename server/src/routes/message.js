import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getMessagesByRoom, getInbox } from "../controllers/message.js";

const messageRouter = express.Router();

messageRouter.get("/inbox", authenticate, getInbox);
messageRouter.get("/:room", authenticate, getMessagesByRoom);

export default messageRouter;
