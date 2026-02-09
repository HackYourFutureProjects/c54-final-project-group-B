import jwt from "jsonwebtoken";
import { logError } from "../util/logging.js";

const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, msg: "Auth token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logError(error);
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
};

export default auth;
