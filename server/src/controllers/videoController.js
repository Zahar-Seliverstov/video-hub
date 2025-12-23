import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

// Загрузка видео
const uploadVideo = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        // Валидация
        if (!title) {
            return res
                .status(400)
                .json({ error: "Название видео обязательно" });
        }

        if (!req.files || !req.files.video) {
            return res
                .status(400)
                .json({ error: "Файл видео не предоставлен" });
        }

        const videoFile = req.files.video;

        // Проверка типа файла
        const allowedMimeTypes = [
            "video/mp4",
            "video/mpeg",
            "video/quicktime",
            "video/x-msvideo",
            "video/webm",
        ];
        if (!allowedMimeTypes.includes(videoFile.mimetype)) {
            return res.status(400).json({
                error: "Неподдерживаемый формат видео. Используйте MP4, MOV, AVI, WEBM",
            });
        }

        // Проверка размера (макс 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (videoFile.size > maxSize) {
            return res
                .status(400)
                .json({ error: "Размер файла не должен превышать 100MB" });
        }

        // Загрузка в Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: "videohub",
                    format: "mp4",
                    transformation: [
                        { quality: "auto" },
                        { fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(videoFile.data);
        });

        // Сохранение в БД
        const video = await prisma.video.create({
            data: {
                title,
                description: description || "",
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                authorId: req.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: "Видео успешно загружено",
            video,
        });
    } catch (error) {
        next(error);
    }
};

// Получение списка видео с фильтрами
const getVideos = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, authorId, isBlocked, search } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Формирование фильтров
        const where = {};

        if (authorId) {
            where.authorId = authorId;
        }

        // Только админы видят заблокированные видео
        if (req.user && req.user.role === "ADMIN") {
            if (isBlocked !== undefined) {
                where.isBlocked = isBlocked === "true";
            }
        } else {
            where.isBlocked = false;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const [videos, total] = await Promise.all([
            prisma.video.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                        },
                    },
                },
            }),
            prisma.video.count({ where }),
        ]);

        // Добавление информации о лайках пользователя
        let videosWithUserLikes = videos;
        if (req.user) {
            const userLikes = await prisma.like.findMany({
                where: {
                    userId: req.user.id,
                    videoId: { in: videos.map((v) => v.id) },
                },
            });

            const likesMap = userLikes.reduce((acc, like) => {
                acc[like.videoId] = like.isLike;
                return acc;
            }, {});

            videosWithUserLikes = videos.map((video) => ({
                ...video,
                userLike:
                    likesMap[video.id] !== undefined
                        ? likesMap[video.id]
                        : null,
            }));
        }

        res.json({
            videos: videosWithUserLikes,
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

// Получение одного видео
const getVideoById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const video = await prisma.video.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        if (!video) {
            return res.status(404).json({ error: "Видео не найдено" });
        }

        // Проверка блокировки
        if (video.isBlocked && (!req.user || req.user.role !== "ADMIN")) {
            return res.status(403).json({ error: "Видео заблокировано" });
        }

        // Информация о лайке пользователя
        let userLike = null;
        if (req.user) {
            const like = await prisma.like.findUnique({
                where: {
                    userId_videoId: {
                        userId: req.user.id,
                        videoId: id,
                    },
                },
            });
            userLike = like ? like.isLike : null;
        }

        res.json({ video: { ...video, userLike } });
    } catch (error) {
        next(error);
    }
};

// Удаление видео
const deleteVideo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const video = await prisma.video.findUnique({
            where: { id },
        });

        if (!video) {
            return res.status(404).json({ error: "Видео не найдено" });
        }

        // Проверка прав: только автор или админ
        if (video.authorId !== req.user.id && req.user.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Недостаточно прав для удаления видео" });
        }

        // Удаление из Cloudinary
        await cloudinary.uploader.destroy(video.publicId, {
            resource_type: "video",
        });

        // Удаление из БД
        await prisma.video.delete({ where: { id } });

        res.json({ message: "Видео успешно удалено" });
    } catch (error) {
        next(error);
    }
};

// Блокировка/разблокировка видео (только админ)
const toggleBlockVideo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const video = await prisma.video.findUnique({
            where: { id },
        });

        if (!video) {
            return res.status(404).json({ error: "Видео не найдено" });
        }

        const updatedVideo = await prisma.video.update({
            where: { id },
            data: { isBlocked: !video.isBlocked },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        res.json({
            message: updatedVideo.isBlocked
                ? "Видео заблокировано"
                : "Видео разблокировано",
            video: updatedVideo,
        });
    } catch (error) {
        next(error);
    }
};

export { uploadVideo, getVideos, getVideoById, deleteVideo, toggleBlockVideo };
