require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const matchRoutes = require('./src/routes/match.routes');
const teamRoutes = require('./src/routes/team.routes');
const attendanceRoutes = require('./src/routes/attendance.routes');
const notificationRoutes = require('./src/routes/notification.routes');

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
                origin: process.env.CLIENT_URL || 'http://localhost:5173',
                credentials: true,
                methods: ['GET', 'POST'],
            },
        });
        app.set('io', io);

        // 3. Middlewares
        app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // 4. Better Auth
        console.log("🔐 Initializing Better Auth...");
        const { auth } = require('./src/config/auth');
        console.log("✅ Better Auth initialized");

        // 5. Routes
        app.use('/api/auth', authRoutes);
        app.all("/api/auth/*", async (req, res) => {
            console.log(`🔌 Auth Request: ${req.method} ${req.url}`);
            try {
                return await auth.handler(req, res);
            } catch (err) {
                console.error("❌ Better Auth Handler Error:", err);
                res.status(500).json({ error: "Internal Server Error", details: err.message });
            }
        });

        app.use('/api/matches', matchRoutes);
        app.use('/api/teams', teamRoutes);
        app.use('/api/attendance', attendanceRoutes);
        app.use('/api/notifications', notificationRoutes);

        app.get('/api/health', (req, res) => {
            res.json({ success: true, message: '⚽ FTMM Backend is running!' });
        });

        // 6. Socket.io handling
        io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            socket.on('join_match_room', (id) => socket.join(`match_${id}`));
            socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
        });

        // 7. Cron
        cron.schedule('*/15 * * * *', async () => {
            try {
                const Match = require('./src/models/Match');
                const now = new Date();
                const upcoming = await Match.find({ status: 'upcoming' });
                for (const match of upcoming) {
                    const matchDateTime = new Date(match.date);
                    const [hours, minutes] = match.time.split(':');
                    matchDateTime.setHours(parseInt(hours), parseInt(minutes));
                    if (matchDateTime <= now) {
                        match.status = 'ongoing';
                        await match.save();
                        io.emit('match_status_changed', { matchId: match._id, status: 'ongoing' });
                    }
                }
            } catch (err) {
                console.error('Cron error:', err.message);
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
