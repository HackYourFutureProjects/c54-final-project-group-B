import User from "../models/User.js";
import { logError } from "../util/logging.js";
import sendCode from "../util/sendCode.js";

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
      return res.status(400).json({
        success: false,
        msg: "Username or Bio contains inappropriate language",
      });
    }

    // 3. Username Format
    if (!/^[a-zA-Z0-9]{3,30}$/.test(username)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid username format" });
    }

    // 4. Email Format
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid email format" });
    }

    // 5. Password Complexity
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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
      verificationRequestsStart: Date.now(),
    });

    // Generate 5-digit verification code
    const verificationCode = Math.floor(
      10000 + Math.random() * 90000,
    ).toString();
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
      verificationCode: verificationCode, // For MVP testing convenience
    });
  } catch (error) {
    // Error details are handled by logError utility
    logError(error);
    res
      .status(500)
      .json({ success: false, msg: "Unable to sign up, try again later" });
  }
};

// --- Login/Logout/Profile/Verification ---
// These features will be added in subsequent PRs.
