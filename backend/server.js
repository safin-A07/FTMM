require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cron = require("node-cron");
const connectDB = require("./src/config/db");

// Route imports
const authRoutes = require("./src/routes/auth.routes");
const matchRoutes = require("./src/routes/match.routes");
const teamRoutes = require("./src/routes/team.routes");
const attendanceRoutes = require("./src/routes/attendance.routes");
const notificationRoutes = require("./src/routes/notification.routes");

const startServer = async () => {
  try {
    console.log("� Starting FTMM Backend...");

    // 1. Connect Database
    await connectDB();
    console.log("📦 Database connection established");

    const app = express();
    const server = http.createServer(app);

    // 2. Socket.io setup
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"],
      },
    });
    app.set("io", io);

    // 3. Middlewares
    app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
      }),
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 4. Better Auth
    console.log("🔐 Initializing Better Auth...");
    const { auth } = require("./src/config/auth");
    const { toNodeHandler } = require("better-auth/node");
    console.log("✅ Better Auth initialized");

    // 5. Routes
    console.log('authRoutes type', typeof authRoutes);
    console.log('matchRoutes type', typeof matchRoutes);
    console.log('teamRoutes type', typeof teamRoutes);
    console.log('attendanceRoutes type', typeof attendanceRoutes);
    console.log('notificationRoutes type', typeof notificationRoutes);

    app.use("/api/auth", authRoutes);
    app.all("/api/auth/*", toNodeHandler(auth));

    app.use("/api/matches", matchRoutes);
    app.use("/api/results", require("./src/routes/results.routes"));
    app.use("/api/teams", teamRoutes);
    app.use("/api/attendance", attendanceRoutes);
    app.use("/api/notifications", notificationRoutes);

    app.get("/api/health", (req, res) => {
      res.json({ success: true, message: "⚽ FTMM Backend is running!" });
    });

    app.get("/", (req, res) => {
      res.json({ 
        success: true, 
        message: "⚽ Welcome to FTMM Backend API!",
        health: "/api/health",
        version: "1.0.0"
      });
    });

    // 6. Socket.io handling
    io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      socket.on("join_match_room", (id) => socket.join(`match_${id}`));
      socket.on("disconnect", () =>
        console.log(`🔌 Client disconnected: ${socket.id}`),
      );
    });

    // 7. Cron
    cron.schedule("*/15 * * * *", async () => {
      try {
        const Match = require("./src/models/Match");
        const now = new Date();
        // Check for matches that should be 'ongoing' or 'finished'
        const matches = await Match.find({ status: { $in: ['open', 'ongoing'] } });

        for (const match of matches) {
          const startDateTime = new Date(match.date);
          const [startHours, startMinutes] = match.time.split(":");
          startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

          const endDateTime = new Date(startDateTime);
          if (match.endingTime) {
            const [endHours, endMinutes] = match.endingTime.split(":");
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

            // If ending time is numerically before starting time, it must be the next day
            if (endDateTime < startDateTime) {
              endDateTime.setDate(endDateTime.getDate() + 1);
            }
          } else {
            // Default: Match lasts 2 hours
            endDateTime.setHours(startDateTime.getHours() + 2);
          }

          let newStatus = null;

          if (now >= endDateTime) {
            if (match.status !== 'finished') newStatus = 'finished';
          } else if (now >= startDateTime) {
            if (match.status !== 'ongoing') newStatus = 'ongoing';
          }

          if (newStatus) {
            match.status = newStatus;
            await match.save();
            const io = app.get("io");
            if (io) {
              io.emit("match_status_changed", {
                matchId: match._id,
                status: newStatus,
              });
            }
            console.log(`[Cron] Match ${match._id} (${match.title}) status updated to: ${newStatus} (End: ${endDateTime.toLocaleString()})`);
          }
        }
      } catch (err) {
        console.error("Cron error:", err.message);
      }
    });

    // 8. Listen
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`\n🚀 FTMM Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("💥 CRITICAL SERVER ERROR:", err);
    process.exit(1);
  }
};

startServer();
