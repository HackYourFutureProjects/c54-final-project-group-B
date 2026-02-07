import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Auth middleware to protect routes and attach user to req
 */
/**
 * Auth middleware to protect routes and attach user to req
 * It verifies the JWT token from cookies and finds the user in the database.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    // If no token, user is not authenticated
    if (!token) {
      return res.status(401).json({ success: false, msg: "Not authenticated" });
    }
    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    // If user not found (e.g. deleted), return error
    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }
    // ... keep existing code ...
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, msg: "Invalid or expired token" });
  }
}

/**
 * Optional Auth middleware.
 * If valid token: attaches user to req.
 * If invalid/missing token: proceeds without user (req.user = null).
 * Does NOT return 401.
 */
export async function tryAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    // If token is invalid (expired/tempered), treat as anonymous
    req.user = null;
    next();
  }
}
