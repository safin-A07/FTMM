require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../src/config/db");

const authRoutes = require("../src/routes/auth.routes");
const matchRoutes = require("../src/routes/match.routes");
const teamRoutes = require("../src/routes/team.routes");
const attendanceRoutes = require("../src/routes/attendance.routes");
const notificationRoutes = require("../src/routes/notification.routes");
const resultsRoutes = require("../src/routes/results.routes");

let app = null;

const createApp = () => {
  const server = express();

  server.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    }),
  );
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const { auth } = require("../src/config/auth");
  const { toNodeHandler } = require("better-auth/node");

  server.use("/api/auth", authRoutes);
  server.all("/api/auth/*", toNodeHandler(auth));

  server.use("/api/matches", matchRoutes);
  server.use("/api/results", resultsRoutes);
  server.use("/api/teams", teamRoutes);
  server.use("/api/attendance", attendanceRoutes);
  server.use("/api/notifications", notificationRoutes);

  server.get("/api/health", (req, res) => {
    res.json({ success: true, message: "FTMM Backend is running" });
  });

  server.get("/", (req, res) => {
    res.json({
      success: true,
      message: "FTMM Backend API",
      health: "/api/health",
    });
  });

  return server;
};

module.exports = async (req, res) => {
  try {
    await connectDB();
    if (!app) app = createApp();
    return app(req, res);
  } catch (error) {
    console.error("Serverless invocation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
