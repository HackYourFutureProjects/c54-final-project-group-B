import jwt from "jsonwebtoken";

/**
 * Generates a JWT and sets it as an httpOnly cookie on the response
 * @param {Object} res - Express response object
 * @param {Object} user - User object (must have _id)
 */
export function generateTokenAndSetCookie(res, user) {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
