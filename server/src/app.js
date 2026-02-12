import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import userRouter from "./routes/user.js";
import listingRouter from "./routes/listing.js";
import { errorHandler } from "./middleware/error.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

// Create an express server
const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

// Rate limiting
app.use(globalLimiter);

// Tell express to use the json middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

/****** Attach routes ******/
/**
 * We use /api/ at the start of every route!
 * As we also host our client code on heroku we want to separate the API endpoints.
 */
app.use("/api/users", userRouter);
app.use("/api/listings", listingRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
