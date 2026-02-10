import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, msg: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded.id; // Attach user ID to request
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res
      .status(401)
      .json({ success: false, msg: "Not authorized, token failed" });
  }
};

export default authMiddleware;
