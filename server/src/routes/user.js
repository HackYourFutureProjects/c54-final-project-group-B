import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  verifyCode,
} from "../controllers/user.js";
import { requireAuth } from "../middleware/auth.js";

const userRouter = express.Router();

// Auth routes
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", requireAuth, logout);
userRouter.get("/me", requireAuth, getMe);
userRouter.put("/me", requireAuth, updateProfile);
userRouter.post("/verify-code", verifyCode);

export default userRouter;
