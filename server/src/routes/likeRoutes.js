import express from "express";
import { toggleLike, getLikeStats } from "../controllers/likeController.js";
import { isAuth, isUser } from "../middleware/auth.js";

const router = express.Router();

// POST /api/likes - Добавление/изменение реакции (USER, ADMIN)
router.post("/", isAuth, isUser, toggleLike);

// GET /api/likes/:videoId - Получение статистики лайков/дизлайков
router.get(
    "/:videoId",
    (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return isAuth(req, res, next);
        }
        next();
    },
    getLikeStats
);

export default router;
