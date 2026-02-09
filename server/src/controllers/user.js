import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { validateUser } from "../models/User.js";
import { logError } from "../util/logging.js";
import validationErrorMessage from "../util/validationErrorMessage.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, result: users });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to get users, try again later" });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = req.body?.user;

    if (typeof user !== "object") {
      res.status(400).json({
        success: false,
        msg: `You need to provide a 'user' object. Received: ${JSON.stringify(
          user,
        )}`,
      });

      return;
    }

    const errorList = validateUser(user);

    if (errorList.length > 0) {
      res
        .status(400)
        .json({ success: false, msg: validationErrorMessage(errorList) });
    } else {
      const { email, password } = user;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ success: false, msg: "Email already in use" });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with hashed password
      const newUser = await User.create({
        ...user,
        password: hashedPassword,
      });

      // Sanitize response (remove password)
      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(201).json({ success: true, user: userResponse });
    }
  } catch (error) {
    logError(error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, msg: "Email already in use" });
      return;
    }
    res
      .status(500)
      .json({ success: false, msg: "Unable to create user, try again later" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please provide both email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 3600000, // 1 hour
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to login user" });
  }
};
