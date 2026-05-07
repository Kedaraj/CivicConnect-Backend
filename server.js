import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import incidentRoutes from "./routes/incidents.js";
import alertRoutes from "./routes/alerts.js";
import complaintRoutes from "./routes/complaints.js";
import locationRoutes from "./routes/locations.js";
import dashboardRoutes from "./routes/dashboard.js";

// Connect to MongoDB (non-blocking — server starts even if DB is slow)
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Make io accessible in routes
app.set("io", io);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "CivicConnect API",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a role-based room
  socket.on("join-role", (role) => {
    socket.join(role);
    console.log(`  → ${socket.id} joined room: ${role}`);
  });

  // Broadcast new incident
  socket.on("new-incident", (data) => {
    io.emit("incident-update", data);
  });

  // Broadcast new alert
  socket.on("new-alert", (data) => {
    io.emit("alert-update", data);
  });

  // Location update
  socket.on("location-update", (data) => {
    socket.broadcast.emit("user-moved", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 CivicConnect API running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
});
