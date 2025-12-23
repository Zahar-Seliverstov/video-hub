import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Генерация JWT токена
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Регистрация
export const register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email и пароль обязательны" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Пароль должен быть не менее 6 символов" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "Пользователь с таким email уже существует" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || "USER",
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        const token = generateToken(user.id);

        res.status(201).json({
            message: "Регистрация успешна",
            token,
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Вход
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email и пароль обязательны" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        const token = generateToken(user.id);

        res.json({
            message: "Вход выполнен успешно",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Получение текущего пользователя
export const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        videos: true,
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        res.json({ user });
    } catch (error) {
        next(error);
    }
};
