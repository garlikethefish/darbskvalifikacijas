<template>
  <nav :class="['nav-links', { active: isMenuOpen }]">
    <router-link class="link" to="/reviews" @click="$emit('close')">
      <SvgIcon class="nav-icon" name="chat-dots" :size="20" />
      {{ t('reviews') }}
    </router-link>
    <router-link class="link" to="/discover" @click="$emit('close')">
      <SvgIcon class="nav-icon" name="target" :size="20" />
      {{ t('discover') }}
    </router-link>
    <router-link class="link" to="/quizzes" @click="$emit('close')">
      <SvgIcon class="nav-icon" name="gamepad" :size="20" />
      {{ t('quizzes') }}
    </router-link>
    <router-link class="link" to="/stats" @click="$emit('close')">
      <SvgIcon class="nav-icon" name="chart" :size="20" />
      {{ t('statistics') }}
    </router-link>
    <router-link v-if="isAdmin" class="link admin-link" to="/admin" @click="$emit('close')">
      <SvgIcon class="nav-icon" name="shield" :size="20" />
      <SvgIcon class="admin-icon" name="shield" :size="16" />
      {{ t('admin') }}
    </router-link>
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
  transition: transform 0.3s ease, opacity 0.25s ease;
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

.nav-icon {
  display: none;
}

@media (max-width: 768px) {
  .nav-links {
    -webkit-backdrop-filter: blur(22px) saturate(150%);
    backdrop-filter: blur(22px) saturate(150%);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06)),
      rgba(30, 28, 39, 0.94);
    border: 1px solid var(--surface-border-strong);
    border-radius: 12px;
    box-shadow: 0 18px 42px var(--shadow-color-strong);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 6px;
    left: 12px;
    margin-top: 0;
    opacity: 0;
    padding: 10px;
    pointer-events: none;
    position: absolute;
    right: auto;
    top: calc(100% + 8px);
    transform: translateY(-10px);
    width: min(260px, calc(100vw - 24px));
    z-index: 1200;
  }

  :global([data-theme="light"]) .nav-links {
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.58)),
      rgba(255, 255, 255, 0.94);
  }

  .link {
    align-items: center;
    border-radius: 8px;
    color: var(--text-color);
    display: flex;
    font-weight: 700;
    gap: 8px;
    margin: 0;
    min-height: 44px;
    padding: 12px 14px;
    width: 100%;
  }

  .link:hover,
  .link.router-link-active {
    background: var(--surface-bg-soft);
    color: var(--accent-color);
  }

  .nav-icon {
    color: currentColor;
    display: inline-flex;
  }

  .admin-icon {
    display: none;
  }

  .nav-links.active {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}
</style>
