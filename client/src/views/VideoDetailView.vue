<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { videosAPI, commentsAPI, likesAPI } from "@/api";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const video = ref(null);
const commentText = ref("");
const userLike = ref(null);
const likesCount = ref(0);
const dislikesCount = ref(0);

const canEdit = computed(() => {
    return authStore.user?.id === video.value?.authorId || authStore.isAdmin;
});

onMounted(async () => {
    try {
        const { data } = await videosAPI.getById(route.params.id);
        video.value = data.video;
        userLike.value = data.video.userLike;
        const stats = await likesAPI.getStats(route.params.id);
        likesCount.value = stats.data.stats.likes;
        dislikesCount.value = stats.data.stats.dislikes;
    } catch (error) {
        console.error(error);
        router.push("/");
    }
});

const handleLike = async (isLike) => {
    if (!authStore.isUser) {
        router.push("/login");
        return;
    }
    try {
        const { data } = await likesAPI.toggle({
            videoId: video.value.id,
            isLike,
        });
        likesCount.value = data.stats.likes;
        dislikesCount.value = data.stats.dislikes;
        userLike.value = data.like ? data.like.isLike : null;
    } catch (error) {
        console.error(error);
    }
};

const handleAddComment = async () => {
    try {
        await commentsAPI.create({
            text: commentText.value,
            videoId: video.value.id,
        });
        const { data } = await videosAPI.getById(route.params.id);
        video.value = data.video;
        commentText.value = "";
    } catch (error) {
        console.error(error);
    }
};

const handleDelete = async () => {
    if (confirm("Удалить видео?")) {
        try {
            await videosAPI.delete(video.value.id);
            router.push("/");
        } catch (error) {
            alert("Ошибка удаления");
        }
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};
</script>

<template>
    <div v-if="video" class="video-detail-view">
        <div class="container">
            <div class="player-wrapper">
                <video
                    :src="video.url"
                    controls
                    class="main-video-player"
                ></video>
            </div>

            <div class="content-layout">
                <section class="video-main-info">
                    <div class="video-header">
                        <h1>{{ video.title }}</h1>
                        <div class="video-stats-row">
                            <div class="author-info">
                                <div class="avatar-placeholder">
                                    {{ video.author.email[0].toUpperCase() }}
                                </div>
                                <div class="author-details">
                                    <span class="author-name">{{
                                        video.author.email.split("@")[0]
                                    }}</span>
                                    <span class="upload-date">{{
                                        formatDate(video.createdAt)
                                    }}</span>
                                </div>
                            </div>

                            <div class="video-actions">
                                <div class="like-group">
                                    <button
                                        @click="handleLike(true)"
                                        class="action-btn like"
                                        :class="{ active: userLike === true }"
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <path
                                                d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                                            ></path>
                                        </svg>
                                        {{ likesCount }}
                                    </button>
                                    <div class="btn-divider"></div>
                                    <button
                                        @click="handleLike(false)"
                                        class="action-btn dislike"
                                        :class="{ active: userLike === false }"
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <path
                                                d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
                                            ></path>
                                        </svg>
                                        {{ dislikesCount }}
                                    </button>
                                </div>

                                <button
                                    v-if="canEdit"
                                    @click="handleDelete"
                                    class="delete-btn"
                                    title="Удалить видео"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                    >
                                        <polyline
                                            points="3 6 5 6 21 6"
                                        ></polyline>
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="description-box" v-if="video.description">
                        <p>{{ video.description }}</p>
                    </div>
                </section>

                <section class="comments-container">
                    <div class="comments-header">
                        <h3>
                            Комментарии <span>{{ video._count.comments }}</span>
                        </h3>
                    </div>

                    <div v-if="authStore.isUser" class="comment-input-block">
                        <div class="avatar-placeholder sm">
                            {{ authStore.user.email[0].toUpperCase() }}
                        </div>
                        <form
                            @submit.prevent="handleAddComment"
                            class="comment-form"
                        >
                            <textarea
                                v-model="commentText"
                                placeholder="Оставьте добрый комментарий..."
                                required
                            ></textarea>
                            <div class="form-actions" v-if="commentText.trim()">
                                <button type="submit" class="btn-send">
                                    Отправить
                                </button>
                            </div>
                        </form>
                    </div>

                    <div v-else class="auth-upsell">
                        <p>
                            <router-link to="/login">Войдите</router-link>,
                            чтобы участвовать в обсуждении.
                        </p>
                    </div>

                    <div class="comments-list">
                        <div
                            v-for="comment in video.comments"
                            :key="comment.id"
                            class="comment-item"
                        >
                            <div class="avatar-placeholder sm">
                                {{ comment.user.email[0].toUpperCase() }}
                            </div>
                            <div class="comment-content">
                                <div class="comment-meta">
                                    <span class="comment-author">{{
                                        comment.user.email.split("@")[0]
                                    }}</span>
                                    <span class="comment-date">{{
                                        formatDate(comment.createdAt)
                                    }}</span>
                                </div>
                                <p class="comment-text">{{ comment.text }}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <div v-else class="loading-full"><div class="spinner"></div></div>
</template>

<style scoped>
.video-detail-view {
    padding-bottom: 100px;
    background: #fff;
}

.player-wrapper {
    background: #000;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 70vh;
    display: flex;
    justify-content: center;
}

.main-video-player {
    width: 100%;
    height: 100%;
    max-width: 1200px;
}

.content-layout {
    max-width: 900px; 
    margin: 24px auto 0;
    padding: 0 20px;
}

.video-header h1 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 16px;
}

.video-stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar-placeholder {
    width: 40px;
    height: 40px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #666;
    font-size: 14px;
}

.author-details {
    display: flex;
    flex-direction: column;
}

.author-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
}

.upload-date {
    font-size: 12px;
    color: #888;
}

.video-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.like-group {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 20px;
    padding: 0 4px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 16px;
    transition: 0.2s;
}

.action-btn:hover {
    background: #e8e8e8;
}

.action-btn.active {
    color: #000;
}

.btn-divider {
    width: 1px;
    height: 20px;
    background: #ddd;
}

.delete-btn {
    background: #f5f5f5;
    border: none;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    color: #888;
    transition: 0.2s;
}

.delete-btn:hover {
    background: #fff1f1;
    color: #e53e3e;
}

.description-box {
    background: #f9f9f9;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 40px;
}

.description-box p {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
}

.comments-header h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 24px;
}

.comments-header span {
    color: #999;
    font-weight: 400;
}

.comment-input-block {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
}

.comment-form {
    flex: 1;
}

.comment-form textarea {
    width: 100%;
    border: none;
    border-bottom: 1px solid #eee;
    padding: 8px 10px;
    box-sizing: border-box;
    font-size: 14px;
    resize: vertical;
    max-height: 200px;
    min-height: 50px;
    transition: 0.3s;
}

.comment-form textarea:focus {
    /* outline: none; */
    /* border-bottom-color: #333; */
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}

.btn-send {
    background: #333;
    color: white;
    padding: 8px 16px;
    border-radius: 18px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.comment-item {
    display: flex;
    gap: 16px;
}

.avatar-placeholder.sm {
    width: 32px;
    height: 32px;
    font-size: 12px;
}

.comment-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
}

.comment-author {
    font-size: 13px;
    font-weight: 600;
}

.comment-date {
    font-size: 11px;
    color: #999;
}

.comment-text {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
}

.auth-upsell {
    padding: 20px;
    background: #fcfcfc;
    border-radius: 8px;
    text-align: center;
    font-size: 14px;
    color: #888;
}

@media (max-width: 600px) {
    .video-stats-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .video-actions {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
