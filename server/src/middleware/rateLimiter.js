import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for testing
  message: {
    success: false,
    msg: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Increased for testing
  message: {
    success: false,
    msg: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sensitiveOpsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Increased for testing
  message: {
    success: false,
    msg: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
