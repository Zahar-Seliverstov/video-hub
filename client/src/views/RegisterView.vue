<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const form = reactive({ email: "", password: "" });

const handleRegister = async () => {
    try {
        await authStore.register(form);
        router.push("/");
    } catch (error) {}
};
</script>
<template>
    <div class="auth-view">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <router-link to="/" class="auth-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32">
                            <rect width="32" height="32" rx="6" fill="#333" />
                            <path d="M12 10L22 16L12 22V10Z" fill="white" />
                        </svg>
                    </router-link>
                    <h1>Создать аккаунт</h1>
                    <p class="auth-subtitle">
                        Присоединяйтесь к сообществу VideoHub
                    </p>
                </div>

                <div v-if="authStore.error" class="error-banner">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{{ authStore.error }}</span>
                </div>

                <form @submit.prevent="handleRegister" class="auth-form">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
                            class="form-input"
                            placeholder="example@mail.com"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Пароль</label>
                        <input
                            v-model="form.password"
                            type="password"
                            class="form-input"
                            placeholder="Минимум 6 символов"
                            minlength="6"
                            required
                        />
                        <p class="input-hint">
                            Используйте надежный пароль для защиты данных
                        </p>
                    </div>

                    <button
                        type="submit"
                        class="btn-submit"
                        :disabled="authStore.loading"
                    >
                        <span v-if="!authStore.loading"
                            >Зарегистрироваться</span
                        >
                        <div v-else class="loader-inline"></div>
                    </button>
                </form>

                <div class="auth-footer">
                    <p>
                        Уже есть аккаунт?
                        <router-link to="/login" class="link-primary"
                            >Войти в систему</router-link
                        >
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-view {
    min-height: calc(100vh - 150px);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fcfcfc;
    padding: 40px 20px;
}

.auth-container {
    width: 100%;
    max-width: 420px;
}

.auth-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 40px;
}

.auth-header {
    text-align: center;
    margin-bottom: 32px;
}

.auth-logo {
    display: inline-block;
    margin-bottom: 16px;
}

.auth-header h1 {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
}

.auth-subtitle {
    font-size: 14px;
    color: #888;
}

.error-banner {
    background-color: #fff5f5;
    border: 1px solid #feb2b2;
    color: #c53030;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: #444;
}

.form-input {
    padding: 12px 14px;
    border: 1px solid #dcdcdc;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: #333;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
}

.input-hint {
    font-size: 11px;
    color: #aaa;
    margin-top: 2px;
}

.btn-submit {
    background: #333;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
}

.btn-submit:hover {
    background: #000;
}

.btn-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.auth-footer {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
}

.auth-footer p {
    font-size: 14px;
    color: #666;
}

.link-primary {
    color: #333;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
}

.link-primary:hover {
    text-decoration: underline;
}

.loader-inline {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 480px) {
    .auth-card {
        padding: 30px 20px;
        border: none;
        background: transparent;
    }
}
</style>
