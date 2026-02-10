import dotenv from "dotenv";

// Ensure env vars are loaded
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "1h",
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 3600 * 1000, // 1 hour
  },
};
