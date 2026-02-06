
import mongoose from "mongoose";
import User from "./src/models/User.js";

const getToken = async () => {
  try {
    // Hardcoded for script reliability
    const uri = "process.env.MONGODB_URI";
    await mongoose.connect(uri);
    
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
