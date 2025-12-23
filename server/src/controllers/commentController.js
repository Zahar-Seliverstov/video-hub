import prisma from "../config/prisma.js";

// Создание комментария
const createComment = async (req, res, next) => {
    try {
        const { text, videoId } = req.body;

        // Валидация
        if (!text || !videoId) {
            return res
                .status(400)
                .json({ error: "Текст комментария и ID видео обязательны" });
        }

        if (text.trim().length < 1) {
            return res
                .status(400)
                .json({ error: "Комментарий не может быть пустым" });
        }

        // Проверка существования видео
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            return res.status(404).json({ error: "Видео не найдено" });
        }

        if (video.isBlocked) {
            return res
                .status(403)
                .json({ error: "Нельзя комментировать заблокированное видео" });
        }

        // Создание комментария
        const comment = await prisma.comment.create({
            data: {
                text: text.trim(),
                userId: req.user.id,
                videoId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: "Комментарий добавлен",
            comment,
        });
    } catch (error) {
        next(error);
    }
};

// Получение комментариев к видео
const getCommentsByVideo = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: { videoId },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
            prisma.comment.count({ where: { videoId } }),
        ]);

        res.json({
            comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Удаление комментария
const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id },
        });

        if (!comment) {
            return res.status(404).json({ error: "Комментарий не найден" });
        }

        // Проверка прав: только автор комментария или админ
        if (comment.userId !== req.user.id && req.user.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Недостаточно прав для удаления комментария" });
        }

        await prisma.comment.delete({ where: { id } });

        res.json({ message: "Комментарий удалён" });
    } catch (error) {
        next(error);
    }
};

export { createComment, getCommentsByVideo, deleteComment };
