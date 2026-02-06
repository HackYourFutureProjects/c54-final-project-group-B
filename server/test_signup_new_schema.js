
import mongoose from "mongoose";
import User from "./src/models/User.js";

const uri = "process.env.MONGODB_URI";

const ts = Date.now();
const username = "newschema" + ts;
const email = "newschema_" + ts + "@test.com";

const run = async () => {
  try {
    // 1. Signup with new fields
    console.log("Signing up with new fields...");
    const res = await fetch("http://localhost:5000/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password: "password123",
        city: "Amsterdam",
        country: "Netherlands",
        bio: "I love biking!"
      })
    });
    
    if (!res.ok) {
        const d = await res.json();
        throw new Error("Signup failed: " + d.msg);
    }
    console.log("Signup success.");

    // 2. Verify DB
    await mongoose.connect(uri);
    const user = await User.findOne({ username });
    console.log("DB User:", user.username);
    console.log("City:", user.city);
    console.log("Country:", user.country);
    console.log("Bio:", user.bio);
    
    if (user.city === "Amsterdam" && user.bio === "I love biking!") {
        console.log("SUCCESS: New fields saved.");
    } else {
        console.log("FAILURE: Fields missing.");
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    if (mongoose.connection.readyState === 1) await mongoose.connection.close();
  }
};

run();
