<template>
    <div class="home-view">
        <div class="container">
            <div class="header-section">
                <div class="title-block">
                    <h1>Библиотека видео</h1>
                    <p class="subtitle" v-if="!videoStore.loading">
                        Найдено: {{ videoStore.videos.length }}
                    </p>
                </div>

                <div class="search-wrapper">
                    <svg
                        class="search-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Поиск по названию..."
                        class="search-input"
                        @input="handleSearch"
                    />
                </div>
            </div>

            <div v-if="videoStore.loading" class="loading-state">
                <div class="spinner"></div>
                <span>Загрузка видео...</span>
            </div>

            <div v-else-if="videoStore.error" class="error-banner">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ videoStore.error }}
            </div>

            <div v-else-if="videoStore.videos.length === 0" class="empty-state">
                <div class="empty-icon">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ddd"
                        stroke-width="1.5"
                    >
                        <path d="M2 13h4l3 9 4-18 3 9h4" />
                    </svg>
                </div>
                <h2>Ничего не найдено</h2>
                <p>Попробуйте другие ключевые слова или сбросьте фильтры</p>
                <button @click="clearSearch" class="btn-link">
                    Очистить поиск
                </button>
            </div>

            <div v-else>
                <div class="videos-grid">
                    <VideoCard
                        v-for="video in videoStore.videos"
                        :key="video.id"
                        :video="video"
                    />
                </div>

                <div
                    v-if="videoStore.pagination.totalPages > 1"
                    class="pagination"
                >
                    <button
                        @click="previousPage"
                        :disabled="videoStore.pagination.page === 1"
                        class="btn-page"
                    >
                        ←
                    </button>

                    <div class="page-numbers">
                        {{ videoStore.pagination.page }} <span>/</span>
                        {{ videoStore.pagination.totalPages }}
                    </div>

                    <button
                        @click="nextPage"
                        :disabled="
                            videoStore.pagination.page >=
                            videoStore.pagination.totalPages
                        "
                        class="btn-page"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useVideoStore } from "@/stores/videoStore";
import VideoCard from "@/components/VideoCard.vue";

const videoStore = useVideoStore();
const searchQuery = ref("");
let searchTimeout = null;

onMounted(() => {
    videoStore.fetchVideos();
});

const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        videoStore.setFilters({ search: searchQuery.value });
    }, 500);
};

const clearSearch = () => {
    searchQuery.value = "";
    videoStore.setFilters({ search: "" });
};

const nextPage = () => {
    videoStore.setPage(videoStore.pagination.page + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const previousPage = () => {
    videoStore.setPage(videoStore.pagination.page - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<style scoped>
.home-view {
    padding: 40px 0 80px;
    background-color: #fcfcfc;
    min-height: 100vh;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #eee;
}

.title-block h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.subtitle {
    font-size: 13px;
    color: #888;
}

.search-wrapper {
    position: relative;
    width: 100%;
    max-width: 320px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #333;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
}

.videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    text-align: center;
}

.empty-icon {
    width: 64px;
    height: 64px;
    background: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.empty-state h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.empty-state p {
    color: #888;
    font-size: 14px;
    margin-bottom: 16px;
}

.btn-link {
    background: none;
    border: none;
    color: #333;
    text-decoration: underline;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 48px;
}

.btn-page {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
    border-color: #333;
    background: #f9f9f9;
}

.btn-page:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.page-numbers {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.page-numbers span {
    color: #ccc;
    margin: 0 4px;
}

@media (max-width: 768px) {
    .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
    .search-wrapper {
        max-width: 100%;
    }
    .videos-grid {
        grid-template-columns: 1fr;
    }
}
</style>
