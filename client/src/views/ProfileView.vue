<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { videosAPI } from "@/api";
import VideoCard from "@/components/VideoCard.vue";

const authStore = useAuthStore();
const videos = ref([]);
const loading = ref(true);

const roleLabel = computed(() => {
    const roles = {
        ADMIN: "Администратор",
        USER: "Пользователь",
        GUEST: "Гость",
    };
    return roles[authStore.user?.role] || authStore.user?.role;
});

onMounted(async () => {
    try {
        const { data } = await videosAPI.getAll({
            authorId: authStore.user.id,
            limit: 100,
        });
        videos.value = data.videos;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
});

const handleDelete = async (id) => {
    if (confirm("Удалить видео?")) {
        try {
            await videosAPI.delete(id);
            videos.value = videos.value.filter((v) => v.id !== id);
        } catch (error) {
            alert("Ошибка удаления");
        }
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};
</script>
<template>
    <div class="profile-view">
        <div class="container">
            <div class="profile-header-card">
                <div class="profile-header-top">
                    <div class="user-meta">
                        <h1>Профиль</h1>
                        <span
                            class="role-badge"
                            :class="authStore.user?.role.toLowerCase()"
                        >
                            {{ roleLabel }}
                        </span>
                    </div>
                </div>

                <div class="profile-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Email адрес</span>
                        <span class="detail-value">{{
                            authStore.user.email
                        }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">На платформе с</span>
                        <span class="detail-value">{{
                            formatDate(authStore.user.createdAt)
                        }}</span>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <div class="section-header">
                    <h2>Мои видео</h2>
                    <span class="count-tag" v-if="videos.length">{{
                        videos.length
                    }}</span>
                </div>

                <div v-if="loading" class="loading-container">
                    <div class="spinner"></div>
                </div>

                <div v-else-if="videos.length === 0" class="empty-state-simple">
                    <div class="empty-msg">
                        У вас пока нет загруженных видео
                    </div>
                    <router-link to="/upload" class="btn-primary-sm">
                        Загрузить первое видео
                    </router-link>
                </div>

                <div v-else class="videos-grid">
                    <VideoCard
                        v-for="video in videos"
                        :key="video.id"
                        :video="video"
                        :show-actions="true"
                        @delete="handleDelete"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-view {
    padding: 40px 0 80px;
    background-color: #fcfcfc;
    min-height: 100vh;
}

.profile-header-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 32px;
    margin-bottom: 48px;
}

.profile-header-top {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f5f5f5;
}

.user-meta {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-meta h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.role-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    background: #f0f0f0;
    color: #666;
    border-radius: 4px;
}

.role-badge.admin {
    background: #333;
    color: #fff;
}

.profile-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-label {
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
    font-weight: 600;
}

.detail-value {
    font-size: 15px;
    color: #333;
    font-weight: 500;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.section-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
}

.count-tag {
    background: #eee;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #666;
}

.videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.empty-state-simple {
    padding: 60px;
    background: white;
    border: 1px dashed #ccc;
    border-radius: 8px;
    text-align: center;
}

.empty-msg {
    color: #888;
    margin-bottom: 20px;
    font-size: 15px;
}

.btn-primary-sm {
    display: inline-block;
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-primary-sm:hover {
    background: #000;
}

@media (max-width: 768px) {
    .profile-details-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}
</style>
