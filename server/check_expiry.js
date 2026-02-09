
import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const checkUserExpiry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: "verify_test@example.com" });
    if (user) {
      console.log(`User: ${user.email}`);
      console.log(`Verified: ${user.isVerified}`);
      if (user.verificationCodeExpires) {
          const expires = new Date(user.verificationCodeExpires);
          const now = new Date();
          const diffMinutes = (expires - now) / 1000 / 60;
          console.log(`Expires At: ${expires.toISOString()}`);
          console.log(`Current Time: ${now.toISOString()}`);
          console.log(`Minutes Remaining (should be close to 15 if just created, but since verified, might be cleared?): ${diffMinutes}`);
          // Note: The controller clears the code and expiry on success. 
          // So if isVerified is true, these might be undefined.
          // I should also check a NEW user to confirm the 15 mins.
      } else {
          console.log("Verification fields cleared (Expected if verified).");
      }
    } else {
        console.log("User not found");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUserExpiry();
