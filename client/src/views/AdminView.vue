<script setup>
import { ref, onMounted } from "vue";
import { videosAPI } from "@/api";
import VideoCard from "@/components/VideoCard.vue";

const videos = ref([]);
const loading = ref(true);
const showBlocked = ref(false);
const searchQuery = ref("");
const pagination = ref({ page: 1, limit: 12, total: 0, totalPages: 0 });

const fetchVideos = async () => {
    loading.value = true;
    try {
        const { data } = await videosAPI.getAll({
            page: pagination.value.page,
            limit: pagination.value.limit,
            isBlocked: showBlocked.value ? undefined : false,
            search: searchQuery.value,
        });
        videos.value = data.videos;
        pagination.value = data.pagination;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchVideos();
});

let searchTimeout;
const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        pagination.value.page = 1;
        fetchVideos();
    }, 500);
};

const handleFilterChange = () => {
    pagination.value.page = 1;
    fetchVideos();
};

const handleDelete = async (id) => {
    if (confirm("Удалить видео?")) {
        try {
            await videosAPI.delete(id);
            fetchVideos();
        } catch (error) {
            alert("Ошибка удаления");
        }
    }
};

const handleToggleBlock = async (id) => {
    try {
        await videosAPI.toggleBlock(id);
        fetchVideos();
    } catch (error) {
        alert("Ошибка изменения статуса");
    }
};

const nextPage = () => {
    pagination.value.page++;
    fetchVideos();
};

const previousPage = () => {
    pagination.value.page--;
    fetchVideos();
};
</script>

<template>
    <div class="admin-view">
        <div class="container">
            <div class="header">
                <h1>Панель администратора</h1>
                <p>Управление видеоконтентом и модерация системы</p>
            </div>

            <div class="content">
                <div class="filters">
                    <div class="search-box">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Поиск по названию или автору..."
                            @input="handleSearch"
                            class="search-input"
                        />
                    </div>

                    <div class="toggle-container">
                        <label class="toggle">
                            <input
                                type="checkbox"
                                v-model="showBlocked"
                                @change="handleFilterChange"
                            />
                            <span class="slider"></span>
                        </label>
                        <label
                            class="toggle-label"
                            @click="showBlocked = !showBlocked"
                        >
                            Показать заблокированные
                        </label>
                    </div>
                </div>

                <div v-if="loading" class="loading">
                    <div class="spinner"></div>
                    <div>Загрузка данных...</div>
                </div>

                <div v-else class="videos-grid">
                    <VideoCard
                        v-for="video in videos"
                        :key="video.id"
                        :video="video"
                        :show-actions="true"
                        @delete="handleDelete"
                        @toggleBlock="handleToggleBlock"
                    />
                </div>

                <div v-if="pagination.totalPages > 1" class="pagination">
                    <button
                        @click="previousPage"
                        :disabled="pagination.page === 1"
                        class="btn-nav"
                    >
                        Назад
                    </button>
                    <div class="page-counter">
                        <span class="current"
                            >Страница {{ pagination.page }}</span
                        >
                        <span class="divider">/</span>
                        <span class="total">{{ pagination.totalPages }}</span>
                    </div>
                    <button
                        @click="nextPage"
                        :disabled="pagination.page >= pagination.totalPages"
                        class="btn-nav"
                    >
                        Вперед
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-view {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.header {
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 20px 30px;
}

.header h1 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.header p {
    font-size: 14px;
    color: #666;
}

.content {
    padding: 30px;
}

.filters {
    margin-bottom: 24px;
}

.search-box {
    margin-bottom: 20px;
}

input[type="text"] {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.2s;
}

input[type="text"]:focus {
    border-color: #333;
}

.toggle-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.toggle {
    position: relative;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ddd;
    border-radius: 24px;
    transition: 0.3s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
}

input:checked + .slider {
    background: #333;
}

input:checked + .slider:before {
    transform: translateX(20px);
}

.toggle-label {
    cursor: pointer;
    font-size: 14px;
    color: #666;
}

.videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.btn-nav {
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-nav:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #ccc;
}

.btn-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-counter {
    font-size: 14px;
    color: #666;
    display: flex;
    gap: 4px;
    align-items: center;
}

.page-counter .current {
    font-weight: 600;
    color: #333;
}

.page-counter .divider {
    color: #ccc;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #888;
    font-size: 14px;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f0f0f0;
    border-top: 3px solid #333;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 600px) {
    .content {
        padding: 20px;
    }
    .videos-grid {
        grid-template-columns: 1fr;
    }
}
</style>
