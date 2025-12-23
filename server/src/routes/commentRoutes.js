import express from "express";
import {
    createComment,
    getCommentsByVideo,
    deleteComment,
} from "../controllers/commentController.js";
import { isAuth, isUser } from "../middleware/auth.js";

const router = express.Router();

// POST /api/comments - Создание комментария (USER, ADMIN)
router.post("/", isAuth, isUser, createComment);

// GET /api/comments/video/:videoId - Получение комментариев к видео
router.get("/video/:videoId", getCommentsByVideo);

// DELETE /api/comments/:id - Удаление комментария (автор или ADMIN)
router.delete("/:id", isAuth, deleteComment);

export default router;
