// Централизованная обработка ошибок
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Prisma ошибки
    if (err.code === "P2002") {
        return res.status(400).json({
            error: "Запись с такими данными уже существует",
        });
    }

    if (err.code === "P2025") {
        return res.status(404).json({
            error: "Запись не найдена",
        });
    }

    // Cloudinary ошибки
    if (err.http_code) {
        return res.status(err.http_code).json({
            error: err.message || "Ошибка загрузки файла",
        });
    }

    // Стандартные ошибки
    const statusCode = err.statusCode || 500;
    const message = err.message || "Внутренняя ошибка сервера";

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

// 404 обработчик
export const notFound = (req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
};
