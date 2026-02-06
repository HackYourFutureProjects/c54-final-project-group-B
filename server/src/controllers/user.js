import User from "../models/User.js";
import { generateTokenAndSetCookie } from "../util/generateToken.js";
import { logError } from "../util/logging.js";
import sendEmail from "../util/sendEmail.js";
import sendCode from "../util/sendCode.js";
import bcrypt from "bcrypt";

// --- Signup ---
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }
    if (!/^[a-zA-Z0-9]{3,30}$/.test(username)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid username format" });
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid email format" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Password must be at least 8 characters",
        });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, msg: "Email or username already exists" });
    }
    const user = await User.create({ username, email, password });
    
    // Generate 5-digit verification code
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send verification code
    await sendCode({ email: user.email, code: verificationCode });

    generateTokenAndSetCookie(res, user);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationCodeExpires;
    
    res.status(201).json({ 
      success: true, 
      user: userObj,
      msg: "Account created! Check the server console for your 5-digit verification code." 
    });
  } catch (error) {
    console.error("Signup error details:", error.message);
    console.error("Stack trace:", error.stack);
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to sign up, try again later" });
  }
};

// --- Login ---
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername },
      ],
    }).select("+password");
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

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ success: false, msg: "Please verify your email to login" });
    }

    generateTokenAndSetCookie(res, user);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to login, try again later" });
  }
};

// --- Logout ---
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, msg: "Logged out" });
};

// --- Get Current User ---
export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Not authenticated" });
  }
  const userObj = req.user.toObject ? req.user.toObject() : req.user;
  delete userObj.password;
  res.status(200).json({ success: true, user: userObj });
};

// --- Update Profile ---
export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.bio === "string")
      updates.bio = req.body.bio.slice(0, 300);
    if (typeof req.body.location === "string")
      updates.location = req.body.location;
    if (typeof req.body.avatarUrl === "string")
      updates.avatarUrl = req.body.avatarUrl;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to update profile" });
  }
};

// --- Verify 5-Digit Code ---
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ success: false, msg: "Email and code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, msg: "Email already verified" });
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ success: false, msg: "Invalid or expired code" });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, msg: "Email verified successfully. You can now login." });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to verify code" });
  }
};
