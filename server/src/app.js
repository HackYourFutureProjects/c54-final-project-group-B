import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import cors from "cors";

// Create an express server
const app = express();

// Tell express to use the json middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // or "*" for all origins during development
    credentials: true,
  }),
);

/****** Attach routes ******/
/**
 * We use /api/ at the start of every route!
 * As we also host our client code on heroku we want to separate the API endpoints.
 */
app.use("/api/users", userRouter);

export default app;
