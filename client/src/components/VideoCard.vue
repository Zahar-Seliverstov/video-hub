<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
    video: {
        type: Object,
        required: true,
    },
    showActions: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["delete", "toggleBlock"]);

const authStore = useAuthStore();

const canEdit = computed(() => {
    return authStore.user?.id === props.video.authorId || authStore.isAdmin;
});

const getThumbnail = (url) => {
    const publicId = url
        .split("/")
        .slice(-2)
        .join("/")
        .replace(/\.[^/.]+$/, "");
    return url.replace(
        "/video/upload/",
        "/video/upload/w_400,h_225,c_fill,q_auto/"
    );
};

const handleImageError = (e) => {
    e.target.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect width="400" height="225" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" dy=".3em"%3ENo Preview%3C/text%3E%3C/svg%3E';
};

const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Сегодня";
    if (days === 1) return "Вчера";
    if (days < 7) return `${days} дней назад`;

    return d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};
</script>

<template>
    <div class="video-card">
        <router-link :to="`/video/${video.id}`" class="video-thumbnail">
            <img
                :src="getThumbnail(video.url)"
                :alt="video.title"
                @error="handleImageError"
            />
            <div class="video-overlay">
                <div class="play-icon">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
            <div v-if="video.isBlocked" class="blocked-badge">
                Заблокировано
            </div>
        </router-link>

        <div class="video-info">
            <router-link :to="`/video/${video.id}`" class="video-title">
                {{ video.title }}
            </router-link>

            <div class="video-meta">
                <span class="author">{{
                    video.author.email.split("@")[0]
                }}</span>
                <span class="dot">•</span>
                <span class="date">{{ formatDate(video.createdAt) }}</span>
            </div>

            <div class="video-stats">
                <div class="stat" title="Лайки">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        />
                    </svg>
                    {{ video._count.likes }}
                </div>
                <div class="stat" title="Комментарии">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                        />
                    </svg>
                    {{ video._count.comments }}
                </div>
            </div>

            <div v-if="showActions" class="video-actions">
                <button
                    v-if="canEdit"
                    @click="$emit('delete', video.id)"
                    class="btn-action btn-delete"
                >
                    Удалить
                </button>
                <button
                    v-if="authStore.isAdmin"
                    @click="$emit('toggleBlock', video.id)"
                    class="btn-action btn-secondary"
                >
                    {{ video.isBlocked ? "Разблокировать" : "Блокировать" }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.video-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
}

.video-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d0d0d0;
}

.video-thumbnail {
    position: relative;
    display: block;
    aspect-ratio: 16 / 9;
    background-color: #f0f0f0;
    overflow: hidden;
}

.video-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.video-card:hover .video-thumbnail img {
    transform: scale(1.05);
}

.video-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
}

.video-thumbnail:hover .video-overlay {
    opacity: 1;
}

.play-icon {
    background: rgba(0, 0, 0, 0.6);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.blocked-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.video-info {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.video-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    text-decoration: none;
    line-height: 1.4;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.video-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #888;
    margin-bottom: 12px;
}

.dot {
    color: #ccc;
}

.video-stats {
    display: flex;
    gap: 12px;
    margin-top: auto;
    padding-bottom: 12px;
}

.stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;
    background: #fafafa;
    padding: 2px 8px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.video-actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
}

.btn-action {
    flex: 1;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #ddd;
    background: white;
    color: #333;
}

.btn-delete {
    color: #d32f2f;
}

.btn-delete:hover {
    background: #fff5f5;
    border-color: #ffcdd2;
}

.btn-secondary:hover {
    background: #f5f5f5;
    border-color: #ccc;
}
</style>
