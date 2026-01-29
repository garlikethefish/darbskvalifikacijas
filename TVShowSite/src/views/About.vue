<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  name: 'About',
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
      <div class="center">
        <h1 id="first-title">{{ t('aboutUs') }}</h1>
        <p>{{ t('aboutText') }}<br><br>{{ t('aboutDescription') }}<br><br>{{ t('satisfiedCustomer') }}</p>
        <img class="rounded-image" :src="'./src/assets/gator.png'">
        <p>{{ t('oneOfOurSatisfiedCustomers') }}</p><br><br>
      </div>
    </div>
</template>

<style>
#first-title{
  padding-top: 50px;
}
</style>