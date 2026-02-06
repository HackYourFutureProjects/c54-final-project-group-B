
import mongoose from "mongoose";
import User from "./src/models/User.js";

const uri = "process.env.MONGODB_URI";

const viewUsers = async () => {
  try {
    await mongoose.connect(uri);
    const users = await User.find({});
    
    console.log("=== USERS COLLECTION ===");
    console.log(`Total Users: ${users.length}`);
    users.forEach(u => {
      console.log("------------------------------------------------");
      console.log(`ID: ${u._id}`);
      console.log(`Username: ${u.username}`);
      console.log(`Email: ${u.email}`);
      console.log(`City: ${u.city}`);
      console.log(`Country: ${u.country}`);
      console.log(`Bio: ${u.bio}`);
      console.log(`Profile: ${u.profilePicture}`);
      console.log(`Verified: ${u.isVerified}`);
      console.log(`Code: ${u.verificationCode || "None"}`);
      console.log("------------------------------------------------");
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    if (mongoose.connection.readyState === 1) await mongoose.connection.close();
  }
};

viewUsers();
