import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9]+$/,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never return password by default
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = token;
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
