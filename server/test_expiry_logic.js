
import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const testExpiry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Cleanup previous test
    await User.deleteOne({ email: "expiry_test@example.com" });

    // Create user manually to trigger pre-save or controller logic? 
    // Wait, the logic is in the CONTROLLER (createUser), not the model pre-save usually.
    // I should call the API or replicate the logic.
    // Calling API is better to test the actual endpoint.
    // But I can't easily call API from this script without fetch/axios.
    // I will use the User model directly but I need to know IF the logic is in the model.
    // I checked user.js controller earlier:
    /*
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    */
    // It is in the CONTROLLER.
    
    // So verification via script requires hitting the endpoint.
    // I will use fetch to hit the local server.
    
    const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user: {
                username: "expirytest",
                email: "expiry_test@example.com",
                password: "Password123!",
                confirmPassword: "Password123!",
                country: "Netherlands",
                city: "Amsterdam",
                bio: "Expiry test"
            }
        })
    });
    
    const data = await response.json();
    console.log("Signup Response:", data);

    if (data.success) {
        const user = await User.findOne({ email: "expiry_test@example.com" });
        if (user && user.verificationCodeExpires) {
            const now = new Date();
            const expires = new Date(user.verificationCodeExpires);
            const diffMinutes = (expires - now) / 1000 / 60;
            console.log(`Expires At: ${expires.toISOString()}`);
            console.log(`Current Time: ${now.toISOString()}`);
            console.log(`Minutes Remaining: ${diffMinutes.toFixed(2)}`);
            
            if (diffMinutes > 14 && diffMinutes < 16) {
                console.log("SUCCESS: Expiry is approx 15 minutes.");
            } else {
                console.log("FAILURE: Expiry is not 15 minutes.");
            }
        } else {
            console.log("User found but no expiry?", user);
        }
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

testExpiry();
