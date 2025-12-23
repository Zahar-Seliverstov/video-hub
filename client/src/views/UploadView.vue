<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { videosAPI } from "@/api";

const router = useRouter();
const form = reactive({ title: "", description: "" });
const selectedFile = ref(null);
const uploading = ref(false);
const progress = ref(0);
const error = ref(null);
const success = ref(false);

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 100 * 1024 * 1024) {
        error.value = "Размер файла не должен превышать 100MB";
        event.target.value = "";
        return;
    }
    selectedFile.value = file;
    error.value = null;
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const handleUpload = async () => {
    if (!selectedFile.value) return;

    uploading.value = true;
    error.value = null;
    progress.value = 0;

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("video", selectedFile.value);

    try {
        // Симуляция прогресса
        const interval = setInterval(() => {
            if (progress.value < 90) progress.value += 10;
        }, 500);

        await videosAPI.upload(formData);

        clearInterval(interval);
        progress.value = 100;
        success.value = true;

        setTimeout(() => {
            router.push("/profile");
        }, 2000);
    } catch (err) {
        error.value = err.response?.data?.error || "Ошибка загрузки видео";
    } finally {
        uploading.value = false;
    }
};
</script>

<template>
    <div class="upload-view">
        <div class="container">
            <div class="upload-card">
                <div class="upload-header">
                    <h1>Загрузить видео</h1>
                    <p class="subtitle">
                        Поделитесь своим контентом с сообществом
                    </p>
                </div>

                <div v-if="error" class="status-banner error">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {{ error }}
                </div>

                <div v-if="success" class="status-banner success">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Видео успешно загружено! Перенаправление...
                </div>

                <form @submit.prevent="handleUpload" class="upload-form">
                    <div class="form-group">
                        <label class="form-label"
                            >Название видео
                            <span class="required">*</span></label
                        >
                        <input
                            v-model="form.title"
                            type="text"
                            class="form-input"
                            placeholder="Например: Мой отпуск 2024"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Описание</label>
                        <textarea
                            v-model="form.description"
                            class="form-input"
                            rows="3"
                            placeholder="Расскажите подробнее о видео..."
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label"
                            >Файл видео <span class="required">*</span></label
                        >
                        <div
                            class="file-drop-zone"
                            :class="{ 'has-file': selectedFile }"
                            @click="$refs.fileInput.click()"
                        >
                            <input
                                ref="fileInput"
                                type="file"
                                accept="video/mp4,video/mpeg,video/quicktime,video/webm"
                                @change="handleFileSelect"
                                hidden
                            />

                            <div v-if="!selectedFile" class="drop-zone-content">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#ccc"
                                    stroke-width="1.5"
                                >
                                    <path
                                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                                    />
                                </svg>
                                <p>Нажмите или перетащите файл сюда</p>
                                <span
                                    >MP4, WebM или QuickTime (макс. 100MB)</span
                                >
                            </div>

                            <div v-else class="selected-file-display">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#333"
                                    stroke-width="2"
                                >
                                    <path d="M23 7l-7 5 7 5V7z"></path>
                                    <rect
                                        x="1"
                                        y="5"
                                        width="15"
                                        height="14"
                                        rx="2"
                                        ry="2"
                                    ></rect>
                                </svg>
                                <div class="file-meta">
                                    <span class="file-name">{{
                                        selectedFile.name
                                    }}</span>
                                    <span class="file-size">{{
                                        formatFileSize(selectedFile.size)
                                    }}</span>
                                </div>
                                <button
                                    type="button"
                                    class="btn-remove"
                                    @click.stop="selectedFile = null"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="uploading" class="upload-progress-section">
                        <div class="progress-header">
                            <span>Загрузка...</span>
                            <span>{{ progress }}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div
                                class="progress-bar-fill"
                                :style="{ width: progress + '%' }"
                            ></div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="btn-submit"
                        :disabled="uploading || !selectedFile"
                    >
                        <span v-if="!uploading">Опубликовать видео</span>
                        <div v-else class="loader-white"></div>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.upload-view {
    padding: 60px 0 100px;
    background-color: #fcfcfc;
    min-height: 100vh;
}

.upload-card {
    max-width: 520px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
}

.upload-header {
    text-align: center;
    margin-bottom: 32px;
}

.upload-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
}

.subtitle {
    font-size: 14px;
    color: #888;
}

.status-banner {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-banner.error {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
}

.status-banner.success {
    background: #f0fff4;
    color: #2f855a;
    border: 1px solid #9ae6b4;
}

.upload-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: #444;
}

.required {
    color: #e53e3e;
}

.form-input {
    padding: 12px 14px;
    border: 1px solid #dcdcdc;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
    background: #fafafa;
}

.form-input:focus {
    outline: none;
    border-color: #333;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.02);
}

.file-drop-zone {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    padding: 30px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #fafafa;
}

.file-drop-zone:hover {
    border-color: #333;
    background: #f5f5f5;
}

.file-drop-zone.has-file {
    border-style: solid;
    border-color: #333;
    background: white;
}

.drop-zone-content p {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin: 12px 0 4px;
}

.drop-zone-content span {
    font-size: 12px;
    color: #999;
}

.selected-file-display {
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
}

.file-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.file-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    word-break: break-all;
}

.file-size {
    font-size: 12px;
    color: #888;
}

.btn-remove {
    background: none;
    border: none;
    font-size: 18px;
    color: #ccc;
    cursor: pointer;
    padding: 4px;
}

.btn-remove:hover {
    color: #e53e3e;
}

.upload-progress-section {
    margin: 8px 0;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #666;
}

.progress-bar-bg {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: #333;
    transition: width 0.3s ease;
}

.btn-submit {
    background: #333;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
    background: #000;
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loader-white {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 600px) {
    .upload-card {
        padding: 30px 20px;
        border: none;
        background: transparent;
    }
}
</style>
