
import mongoose from "mongoose";
import User from "./server/src/models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const getToken = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URL);
    
    const user = await User.findOne({ username: "browsertestuser123" });
    if (user) {
      console.log(`TOKEN:${user.verificationToken}`);
    } else {
      console.log("User not found");
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getToken();
