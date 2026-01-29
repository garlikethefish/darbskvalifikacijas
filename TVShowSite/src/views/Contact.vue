<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  name: 'Contact',
  data() {
    return {
      currentLanguage: 'en'
    }
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
      this.$forceUpdate();
    });
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.$forceUpdate();
    });
  }
};
</script>

<template>
    <div id="app">
        <h1 id="first-title">{{ t('contactUs') }}</h1>
        
        <div class="cats">
            <img :src="'./src/assets/cats.png'">
            <p>{{ t('ourSupportTeam') }}</p>
        </div>
        <h1 class="center">{{ t('readyToTechSupport') }}</h1>
        <p class="caption">{{ t('termsAndConditions') }}</p><br><br>
    </div>
</template>
