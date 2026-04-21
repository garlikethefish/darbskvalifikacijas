<template>
  <nav :class="['nav-links', { active: isMenuOpen }]">
    <router-link class="link" to="/reviews" @click="$emit('close')">{{ t('reviews') }}</router-link>
    <router-link class="link" to="/discover" @click="$emit('close')">{{ t('discover') }}</router-link>
    <router-link class="link" to="/quizzes" @click="$emit('close')">{{ t('quizzes') }}</router-link>
    <router-link class="link" to="/stats" @click="$emit('close')">{{ t('statistics') }}</router-link>
    <router-link v-if="isAdmin" class="link admin-link" to="/admin" @click="$emit('close')"><SvgIcon name="shield" :size="16" /> {{ t('admin') }}</router-link>
  </nav>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';
import SvgIcon from '@/components/SvgIcon.vue';

export default {
  components: { SvgIcon },
  props: {
    isMenuOpen: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      currentLanguage: 'en',
      isAdmin: false
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    checkAdmin() {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        this.isAdmin = auth?.loggedIn && auth?.user?.role === 'admin';
      } catch {
        this.isAdmin = false;
      }
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.checkAdmin();
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  }
}
</script>

<style scoped>
.nav-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  transition: transform 0.3s ease;
}

.link {
  margin: 0 8px;
}

.link:hover {
  color: var(--text-color);
}

.admin-link {
  color: var(--accent-color);
  font-weight: 600;
}

@media (max-width: 500px) {
    .nav-links a {
        margin: 10px 0;
        font-weight: bold;
        padding-left: 10px;
    }
    .nav-links {
        display: flex;
        position: absolute;
        top: 100px;
        left: -100%;
        width: 100%;
        gap: 0;
        background: linear-gradient(180deg, var(--dark-bg-color) 33%, var(--background-color) 100%);
        border-bottom: 2px solid var(--text-color);
        border-top: 2px solid var(--text-color);
        transition: left 0.3s ease;
        flex-direction: column;
        padding: 20px;
        box-sizing: border-box;
        z-index: 1000;
    }
    .link {
        margin: 10px 0;
        padding-left: 10px;
        color: var(--text-color);
    }

    .nav-links.active {
        left: 0;
    }
}
</style>
