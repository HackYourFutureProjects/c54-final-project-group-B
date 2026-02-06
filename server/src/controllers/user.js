import User from "../models/User.js";
import { generateTokenAndSetCookie } from "../util/generateToken.js";
import { logError } from "../util/logging.js";
import sendEmail from "../util/sendEmail.js";
import sendCode from "../util/sendCode.js";
import bcrypt from "bcrypt";

import { Filter } from "bad-words";

// --- Signup ---
export const signup = async (req, res) => {
  try {
    const { username, email, password, city, country, bio } = req.body;
    
    // 1. Check Required Fields
    if (!username || !email || !password || !city || !country || !bio) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    // 2. Profanity Check
    const filter = new Filter();
    if (filter.isProfane(username) || filter.isProfane(bio)) {
      return res.status(400).json({ success: false, msg: "Username or Bio contains inappropriate language" });
    }

    // 3. Username Format
    if (!/^[a-zA-Z0-9]{3,30}$/.test(username)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid username format" });
    }

    // 4. Email Format
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid email format" });
    }

    // 5. Password Complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        msg: "Password must differ: 1 Upper, 1 Lower, 1 Number, 1 Symbol, Min 8 chars",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, msg: "Email or username already exists" });
    }
    const user = await User.create({ 
      username, 
      email, 
      password,
      city,
      country,
      bio,
      profilePicture: "",
      verificationRequestsCount: 1,
      verificationRequestsStart: Date.now() 
    });
    
    // Generate 5-digit verification code
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send verification code
    await sendCode({ email: user.email, code: verificationCode });

    // No auto-login after signup. User must verify first.
    // generateTokenAndSetCookie(res, user);
    
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationCodeExpires;
    
    res.status(201).json({ 
      success: true, 
      user: userObj,
      msg: "Account created! Check the server console for your 5-digit verification code.",
      verificationCode: verificationCode // For MVP testing convenience 
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
    // user.verificationRequestsCount = 0; // Optional: Reset on success? No requirement, but good practice.
    await user.save();

    res.status(200).json({ success: true, msg: "Email verified successfully. You can now login." });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to verify code" });
  }
};

// --- Resend Code ---
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, msg: "Already verified" });
    }

    // 1. Check if current code is still valid (Wait 15 mins rule)
    if (user.verificationCodeExpires && user.verificationCodeExpires > Date.now()) {
      const remaining = Math.ceil((user.verificationCodeExpires - Date.now()) / 1000 / 60);
      return res.status(400).json({ 
        success: false, 
        msg: `Please wait ${remaining} minutes before requesting a new code.` 
      });
    }

    // 2. Rate Limiting (3 per 8 hours)
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;
    const now = Date.now();
    
    // Initialize if missing (backward compatibility)
    if (!user.verificationRequestsStart) {
      user.verificationRequestsStart = now;
      user.verificationRequestsCount = 0; // Will become 1
    }

    // Check if window expired
    if (now - user.verificationRequestsStart > EIGHT_HOURS) {
      // Reset window
      user.verificationRequestsStart = now;
      user.verificationRequestsCount = 0;
    }

    if (user.verificationRequestsCount >= 3) {
      return res.status(429).json({ 
        success: false, 
        msg: "Limit exceeded. You cannot sign up/resend code. Try again tomorrow (in 8 hours)." 
      });
    }

    // Generate New Code
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = now + 15 * 60 * 1000;
    user.verificationRequestsCount += 1;
    await user.save();

    await sendCode({ email: user.email, code: verificationCode });

    res.status(200).json({ 
      success: true, 
      msg: "New code sent! Check server console.",
      nextExpiry: user.verificationCodeExpires,
      verificationCode: verificationCode // For MVP testing convenience 
    });

  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to resend code" });
  }
};

// --- Get Status (For Countdown) ---
export const getVerificationStatus = async (req, res) => {
  try {
    const { email } = req.body; // Unsecured for now, or use POST
    if (!email) return res.status(400).json({ success: false });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false });

    res.status(200).json({
      success: true,
      expiresAt: user.verificationCodeExpires,
      isVerified: user.isVerified
    });
  } catch(error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("username email isVerified avatarUrl");
    res.status(200).json({ success: true, result: users });
  } catch (error) {
    logError(error);
    res.status(500).json({ success: false, msg: "Unable to get users" });
  }
};
