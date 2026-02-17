// Load our .env variables
import dotenv from "dotenv";
import express from "express";
dotenv.config();

import app from "./app.js";
import { logInfo, logError } from "./util/logging.js";
import connectDB from "./db/connectDB.js";
import testRouter from "./testRouter.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Map to track online users (userId -> Set of socketIds)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  let currentUserId = null;

  socket.on("join_room", (data) => {
    // data can be just room string or { room, userId }
    const { room, userId } = typeof data === "string" ? { room: data } : data;
    socket.join(room);

    if (userId) {
      currentUserId = userId;
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      io.emit("user_status_change", { userId, status: "online" });
    }
  });

  socket.on("send_message", async (msg) => {
    try {
      // Check if receiver is online and in the same room
      // This is slightly complex to track who is in which room,
      // but for now let's just create the message.
      const savedMessage = await Message.create(msg);
      io.to(msg.room).emit("receive_message", savedMessage);
    } catch (error) {
      logError(error);
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing_status", {
      userId: data.userId,
      isTyping: true,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("typing_status", {
      userId: data.userId,
      isTyping: false,
    });
  });

  socket.on("disconnect", () => {
    if (currentUserId && onlineUsers.has(currentUserId)) {
      onlineUsers.get(currentUserId).delete(socket.id);
      if (onlineUsers.get(currentUserId).size === 0) {
        onlineUsers.delete(currentUserId);
        io.emit("user_status_change", {
          userId: currentUserId,
          status: "offline",
        });
      }
    }
  });

  // Helper to check online status
  socket.on("check_online_status", (userId) => {
    socket.emit("online_status_result", {
      userId,
      isOnline: onlineUsers.has(userId),
    });
  });
});

// Check for required environment variables
const requiredEnv = [
  "JWT_SECRET",
  "MONGODB_URL",
  "MAILTRAP_USER",
  "MAILTRAP_PASS",
];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `❌ CRITICAL: Missing environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

// The environment should set the port
const port = process.env.PORT;

if (port == null) {
  // If this fails, make sure you have created a `.env` file in the right place with the PORT set
  logError(new Error("Cannot find a PORT number, did you create a .env file?"));
}

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      logInfo(`Server started on port ${port}`);
    });
  } catch (error) {
    logError(error);
  }
};

/****** Host our client code for Heroku *****/
/**
 * We only want to host our client code when in production mode as we then want to use the production build that is built in the dist folder.
 * When not in production, don't host the files, but the development version of the app can connect to the backend itself.
 */
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(new URL("../../client/dist", import.meta.url).pathname),
  );
  // Redirect * requests to give the client data
  app.get("/*file", (req, res) =>
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
