import mongoose from "mongoose";

const connectDB = () => {
    console.log(" [DEBUG] Attempting to connect to MongoDB URI:", process.env.MONGODB_URL ? "DEFINED" : "UNDEFINED");
    return mongoose.connect(process.env.MONGODB_URL);
};

export default connectDB;
