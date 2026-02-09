import express from "express";
import { signup } from "../controllers/user.js";

const userRouter = express.Router();

// Auth routes
// Auth routes
userRouter.post("/signup", signup);
// userRouter.post("/login", login);
// userRouter.post("/logout", requireAuth, logout);
// userRouter.get("/me", tryAuth, getMe);
// userRouter.put("/me", requireAuth, updateProfile);
// userRouter.post("/verify-code", verifyCode);
// userRouter.post("/resend-code", resendCode);
// userRouter.post("/verification-status", getVerificationStatus);

// User List
// userRouter.get("/", getAllUsers);

export default userRouter;
