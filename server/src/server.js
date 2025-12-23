import "dotenv/config";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload настройки
app.use(
    fileUpload({
        limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
        abortOnLimit: true,
        useTempFiles: false,
        debug: process.env.NODE_ENV === "development",
    })
);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "VideoHub API is running",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VideoHub Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
});

export default app;
