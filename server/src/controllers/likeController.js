import prisma from "../config/prisma.js";

// Добавление или изменение реакции
const toggleLike = async (req, res, next) => {
    try {
        const { videoId, isLike } = req.body;

        // Валидация
        if (!videoId || isLike === undefined) {
            return res
                .status(400)
                .json({ error: "ID видео и тип реакции обязательны" });
        }

        if (typeof isLike !== "boolean") {
            return res.status(400).json({
                error: "Тип реакции должен быть boolean (true - like, false - dislike)",
            });
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
                .json({ error: "Нельзя реагировать на заблокированное видео" });
        }

        // Проверка существующей реакции
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_videoId: {
                    userId: req.user.id,
                    videoId,
                },
            },
        });

        let like;
        let message;

        if (existingLike) {
            if (existingLike.isLike === isLike) {
                // Если пользователь нажимает на ту же кнопку - убираем реакцию
                await prisma.like.delete({
                    where: { id: existingLike.id },
                });
                message = "Реакция удалена";
                like = null;
            } else {
                // Изменение реакции
                like = await prisma.like.update({
                    where: { id: existingLike.id },
                    data: { isLike },
                });
                message = isLike ? "Изменено на лайк" : "Изменено на дизлайк";
            }
        } else {
            // Создание новой реакции
            like = await prisma.like.create({
                data: {
                    userId: req.user.id,
                    videoId,
                    isLike,
                },
            });
            message = isLike ? "Лайк добавлен" : "Дизлайк добавлен";
        }

        // Получение обновленной статистики
        const likesCount = await prisma.like.count({
            where: { videoId, isLike: true },
        });

        const dislikesCount = await prisma.like.count({
            where: { videoId, isLike: false },
        });

        res.json({
            message,
            like,
            stats: {
                likes: likesCount,
                dislikes: dislikesCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Получение статистики лайков/дизлайков для видео
const getLikeStats = async (req, res, next) => {
    try {
        const { videoId } = req.params;

        const [likesCount, dislikesCount] = await Promise.all([
            prisma.like.count({ where: { videoId, isLike: true } }),
            prisma.like.count({ where: { videoId, isLike: false } }),
        ]);

        // Если пользователь авторизован, получаем его реакцию
        let userLike = null;
        if (req.user) {
            const like = await prisma.like.findUnique({
                where: {
                    userId_videoId: {
                        userId: req.user.id,
                        videoId,
                    },
                },
            });
            userLike = like ? like.isLike : null;
        }

        res.json({
            stats: {
                likes: likesCount,
                dislikes: dislikesCount,
            },
            userLike,
        });
    } catch (error) {
        next(error);
    }
};

export { toggleLike, getLikeStats };
