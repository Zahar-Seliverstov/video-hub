import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/register - Регистрация
router.post("/register", register);

// POST /api/auth/login - Вход
router.post("/login", login);

// GET /api/auth/me - Получение данных текущего пользователя
router.get("/me", isAuth, getMe);

export default router;
