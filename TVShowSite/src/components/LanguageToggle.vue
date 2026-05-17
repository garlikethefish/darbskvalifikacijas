<template>
  <div class="language-toggle">
    <button 
      class="lang-btn" 
      :class="{ active: currentLanguage === 'en' }"
      @click="setLang('en')"
      title="English"
    >
      EN
    </button>
    <span class="separator">|</span>
    <button 
      class="lang-btn" 
      :class="{ active: currentLanguage === 'lv' }"
      @click="setLang('lv')"
      title="Latviešu"
    >
      LV
    </button>
  </div>
</template>

<script>
import { getCurrentLanguage, setLanguage } from '@/services/translations.js';

export default {
  name: 'LanguageToggle',
  data() {
    return {
      currentLanguage: 'en'
    };
  },
  methods: {
    setLang(lang) {
      this.currentLanguage = lang;
      setLanguage(lang);
      // Izsūta pielāgotu notikumu globālai valodas maiņai
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
      this.$emit('language-change', lang);
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
  }
};
</script>

<style scoped>
.language-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(112, 233, 116, 0.1);
  border: 1px solid rgba(112, 233, 116, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  margin-right: 15px;
  width: auto;
}

.lang-btn {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 8px;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.lang-btn:hover {
  color: var(--accent-color);
  background: rgba(112, 233, 116, 0.15);
}

.lang-btn.active {
  color: var(--accent-color);
  background: rgba(112, 233, 116, 0.2);
}

.separator {
  color: rgba(112, 233, 116, 0.3);
}

@media (max-width: 768px) {
  .language-toggle {
    margin-right: 0;
    padding: 4px 8px;
  }

  .lang-btn {
    font-size: 12px;
    padding: 3px 6px;
  }
}

@media (max-width: 500px) {
  .language-toggle {
    gap: 4px;
    padding: 4px 6px;
  }

  .lang-btn {
    font-size: 11px;
    padding: 3px 4px;
  }
}
</style>
