
import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const getVerificationCode = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne().sort({ createdAt: -1 });
    if (user) {
      console.log(`User: ${user.email}`);
      console.log(`Code: ${user.verificationCode}`);
    } else {
        console.log("No user found");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

getVerificationCode();
