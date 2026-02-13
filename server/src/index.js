// Load our .env variables
import dotenv from "dotenv";
import express from "express";
dotenv.config(); // reads from server/.env when running from server folder

import app from "./app.js";
import { logInfo, logError } from "./util/logging.js";
import connectDB from "./db/connectDB.js";
import testRouter from "./testRouter.js";

// Required env vars
const requiredEnv = ["JWT_SECRET", "MONGODB_URL", "EMAIL_USER", "EMAIL_PASS"];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logInfo(`✅ Server started on port ${port}`);
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

/****** Host our client code for production *****/
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(new URL("../../client/dist", import.meta.url).pathname),
  );

  app.get("/*", (req, res) =>
    res.sendFile(
      new URL("../../client/dist/index.html", import.meta.url).pathname,
    ),
  );
}

/****** For cypress we want to provide an endpoint to seed our data ******/
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRouter);
}

// Start the server
startServer();
