<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
};

const handleLogout = () => {
    authStore.logout();
    closeMobileMenu();
    router.push("/");
};
</script>
<template>
    <nav class="navbar">
        <div class="container navbar-inner">
            <div class="navbar-content">
                <router-link to="/" class="logo">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="6" fill="#333" />
                        <path d="M12 10L22 16L12 22V10Z" fill="white" />
                    </svg>
                    <span class="logo-text">VideoHub</span>
                </router-link>

                <div class="navbar-menu">
                    <router-link to="/" class="nav-link">Главная</router-link>

                    <template v-if="authStore.isAuthenticated">
                        <router-link
                            v-if="authStore.isUser"
                            to="/upload"
                            class="nav-link"
                        >
                            Загрузить
                        </router-link>

                        <router-link to="/profile" class="nav-link">
                            Профиль
                        </router-link>

                        <router-link
                            v-if="authStore.isAdmin"
                            to="/admin"
                            class="nav-link admin-link"
                        >
                            Админка
                        </router-link>

                        <button
                            @click="handleLogout"
                            class="btn-nav btn-logout"
                        >
                            Выход
                        </button>
                    </template>

                    <template v-else>
                        <router-link to="/login" class="nav-link">
                            Вход
                        </router-link>
                        <router-link to="/register" class="btn-primary-nav">
                            Регистрация
                        </router-link>
                    </template>
                </div>

                <button class="mobile-menu-btn" @click="toggleMobileMenu">
                    <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            v-if="!mobileMenuOpen"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path v-else d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div v-if="mobileMenuOpen" class="mobile-menu">
                <router-link
                    to="/"
                    class="mobile-nav-link"
                    @click="closeMobileMenu"
                >
                    Главная
                </router-link>

                <template v-if="authStore.isAuthenticated">
                    <router-link
                        v-if="authStore.isUser"
                        to="/upload"
                        class="mobile-nav-link"
                        @click="closeMobileMenu"
                    >
                        Загрузить
                    </router-link>

                    <router-link
                        to="/profile"
                        class="mobile-nav-link"
                        @click="closeMobileMenu"
                    >
                        Профиль
                    </router-link>

                    <router-link
                        v-if="authStore.isAdmin"
                        to="/admin"
                        class="mobile-nav-link admin-mobile"
                        @click="closeMobileMenu"
                    >
                        Админка
                    </router-link>

                    <button
                        @click="handleLogout"
                        class="mobile-nav-link logout-mobile"
                    >
                        Выйти из аккаунта
                    </button>
                </template>

                <template v-else>
                    <router-link
                        to="/login"
                        class="mobile-nav-link"
                        @click="closeMobileMenu"
                    >
                        Вход
                    </router-link>
                    <router-link
                        to="/register"
                        class="mobile-nav-link register-mobile"
                        @click="closeMobileMenu"
                    >
                        Регистрация
                    </router-link>
                </template>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
}

/* Logo */
.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    transition: opacity 0.2s;
}

.logo:hover {
    opacity: 0.8;
}

.logo-text {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    letter-spacing: -0.01em;
}

/* Desktop Menu */
.navbar-menu {
    display: flex;
    align-items: center;
    gap: 24px;
}

.nav-link {
    font-size: 14px;
    color: #666;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
    color: #333;
}

.admin-link {
    color: #888;
    padding: 4px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Buttons */
.btn-nav {
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #ddd;
    color: #333;
    transition: all 0.2s;
}

.btn-nav:hover {
    background: #f5f5f5;
    border-color: #ccc;
}

.btn-primary-nav {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
    text-decoration: none;
    background: #333;
    color: white;
    transition: background 0.2s;
}

.btn-primary-nav:hover {
    background: #000;
}

/* Mobile Controls */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 4px;
}

/* Mobile Menu Dropdown */
.mobile-menu {
    display: none;
    padding-bottom: 20px;
    flex-direction: column;
    gap: 4px;
}

@media (max-width: 768px) {
    .navbar-menu {
        display: none;
    }

    .mobile-menu-btn {
        display: block;
    }

    .mobile-menu {
        display: flex;
    }

    .mobile-nav-link {
        padding: 12px 16px;
        font-size: 15px;
        color: #333;
        text-decoration: none;
        border-radius: 4px;
        background: #fafafa;
        border: 1px solid #eee;
        transition: background 0.2s;
    }

    .mobile-nav-link:hover {
        background: #f0f0f0;
    }

    .register-mobile {
        background: #333;
        color: white;
        border-color: #333;
    }

    .logout-mobile {
        color: #d32f2f;
        background: #fff;
        text-align: left;
        cursor: pointer;
    }
}
</style>
