import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

// User controller imports
import {
  createUser,
  getUsers,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  getMe,
  logoutUser,
} from "./controllers/user.js";

// Middleware
import { authenticate } from "./middleware/auth.js"; // Your existing middleware
import { globalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/error.js";

// Create Express app
const app = express();

// Security & Logging Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(globalLimiter);

// Standard Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// ===== Routes =====

// User Router
const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify", verifyEmail);
userRouter.post("/resend-code", resendVerificationCode);
userRouter.post("/request-reset", requestPasswordReset);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/me", getMe);
userRouter.post("/logout", logoutUser);

// Profile route protected with authenticate middleware
userRouter.get("/profile", authenticate, async (req, res) => {
  // Middleware provides req.user
  res.json(req.user);
});

// Attach userRouter
app.use("/api/users", userRouter);

// Listing Router (existing)
import listingRouter from "./routes/listing.js";
app.use("/api/listings", listingRouter);

// Error Handling Middleware
app.use(errorHandler);

export default app;
