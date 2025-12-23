import express from "express";
import {
    uploadVideo,
    getVideos,
    getVideoById,
    deleteVideo,
    toggleBlockVideo,
} from "../controllers/videoController.js";
import { isAuth, isUser, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/videos - Загрузка видео (USER, ADMIN)
router.post("/", isAuth, isUser, uploadVideo);

// GET /api/videos - Получение списка видео (доступно всем, но с разными правами)
router.get(
    "/",
    (req, res, next) => {
        // Пытаемся получить пользователя, но не требуем обязательной авторизации
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return isAuth(req, res, next);
        }
        next();
    },
    getVideos
);

// GET /api/videos/:id - Получение одного видео
router.get(
    "/:id",
    (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return isAuth(req, res, next);
        }
        next();
    },
    getVideoById
);

// DELETE /api/videos/:id - Удаление видео (автор или ADMIN)
router.delete("/:id", isAuth, deleteVideo);

// PATCH /api/videos/:id/block - Блокировка/разблокировка видео (только ADMIN)
router.patch("/:id/block", isAuth, isAdmin, toggleBlockVideo);

export default router;
