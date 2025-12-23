import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Проверка наличия токена и извлечение пользователя
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Токен не предоставлен" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            return res.status(401).json({ error: "Пользователь не найден" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Неверный токен" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Токен истёк" });
        }
        return res.status(500).json({ error: "Ошибка аутентификации" });
    }
};

// Проверка роли администратора
export const isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res
            .status(403)
            .json({ error: "Доступ запрещён. Требуются права администратора" });
    }
    next();
};

// Проверка, что пользователь авторизован (не гость)
export const isUser = (req, res, next) => {
    if (req.user.role === "GUEST") {
        return res
            .status(403)
            .json({ error: "Доступ запрещён. Требуется роль USER или выше" });
    }
    next();
};
