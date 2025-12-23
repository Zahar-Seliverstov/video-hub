import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Токен истёк или невалиден
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    getMe: () => api.get("/auth/me"),
};

// Videos API
export const videosAPI = {
    getAll: (params) => api.get("/videos", { params }),
    getById: (id) => api.get(`/videos/${id}`),
    upload: (formData) =>
        api.post("/videos", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    delete: (id) => api.delete(`/videos/${id}`),
    toggleBlock: (id) => api.patch(`/videos/${id}/block`),
};

// Comments API
export const commentsAPI = {
    create: (data) => api.post("/comments", data),
    getByVideo: (videoId, params) =>
        api.get(`/comments/video/${videoId}`, { params }),
    delete: (id) => api.delete(`/comments/${id}`),
};

// Likes API
export const likesAPI = {
    toggle: (data) => api.post("/likes", data),
    getStats: (videoId) => api.get(`/likes/${videoId}`),
};
