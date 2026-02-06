import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  verifyEmail,
} from "../controllers/user.js";
import { requireAuth } from "../middleware/auth.js";

const userRouter = express.Router();

// Auth routes
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", requireAuth, logout);
userRouter.get("/me", requireAuth, getMe);
userRouter.put("/me", requireAuth, updateProfile);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/verify-email", verifyEmail); // Support POST as well if needed, but GET is standard for links

export default userRouter;
