<template>
    <footer class="social-media">
        <p>{{ t('allRightsReserved') }}</p>
        <p>{{ t('ourSocialMedia') }}</p>
        <div class="center">
            <a href="https://www.instagram.com/" class="social-link"><img src="@/assets/special_icons/icons8-instagram.svg" alt="Instagram" class="social-icon" /></a>
            <a href="https://www.youtube.com/" class="social-link"><img src="@/assets/special_icons/icons8-youtube.svg" alt="YouTube" class="social-icon" /></a>
        </div>
    </footer>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';

export default {
  data() {
    return {
      currentLanguage: 'en'
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  }
};
</script>

<style scoped>
    footer{
        bottom: 0;
        padding-top: 20px;
        width:100%;
        background: var(--dark-bg-color);
        min-height: 50px;
    }
    p{
        display: block;
        text-align: center;
    }
    a{
        padding: 5px;
    }
    .center{
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
    }
    .social-link {
        color: var(--text-color);
        transition: color 0.3s ease, transform 0.3s ease;
        display: inline-flex;
    }
    .social-link:hover {
        color: var(--accent-color);
        transform: translateY(-2px);
    }
    .social-icon {
        width: 40px;
        height: 40px;
        filter: var(--icon-filter);
        transition: filter 0.3s ease;
    }
</style>