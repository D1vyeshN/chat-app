import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import roomRoutes from "./routes/room.route";
import messageRoutes from "./routes/message.route";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

export default app;
