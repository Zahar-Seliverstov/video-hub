<template>
    <footer class="footer">
        <div class="container footer-content">
            <div class="footer-left">
                <div class="brand">
                    <svg width="18" height="18" viewBox="0 0 32 32">
                        <rect width="32" height="32" rx="6" fill="#333"/>
                        <path d="M12 10L22 16L12 22V10Z" fill="white" />
                    </svg>
                    <span class="brand-name">VideoHub</span>
                </div>
                <span class="copyright">© {{ currentYear }}</span>
            </div>

            <div class="footer-right">
                <router-link 
                    v-if="authStore.isAdmin" 
                    to="/admin" 
                    class="admin-badge"
                >
                    Панель управления
                </router-link>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
    background-color: #ffffff;
    border-top: 1px solid #f0f0f0;
    padding: 20px 0;
    margin-top: auto;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0.9;
}

.brand-name {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    letter-spacing: -0.01em;
}

.copyright {
    font-size: 13px;
    color: #a0a0a0;
}

.admin-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #666;
    text-decoration: none;
    padding: 4px 10px;
    background: #f5f5f5;
    border-radius: 4px;
    transition: all 0.2s;
}

.admin-badge:hover {
    background: #eeeeee;
    color: #000;
}

@media (max-width: 480px) {
    .footer-content {
        flex-direction: column;
        gap: 12px;
    }
}
</style>