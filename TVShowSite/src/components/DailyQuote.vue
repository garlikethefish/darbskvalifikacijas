<template>
    <div v-if="quote" class="quote-content"> <!-- v-if so that doesnt display elements before quote data loaded-->
        <h1 class="quote-text">"{{ formattedQuote }}"</h1>
        <p class="quote-series">{{ quote.series}}</p>
    </div>
</template>
<style scoped>
.quote-content {
  animation: heroIntro 880ms cubic-bezier(.2,.9,.25,1) both;
}

.quote-text {
  font-size: 40px;
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;
  font-weight: 700;
  font-style: italic;
  color: var(--text-color);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  line-height: 1.4;
}

.quote-series {
  margin: 0;
  color: var(--subtitle-color);
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  opacity: 0.95;
  font-style: italic;
  font-weight: 600;
  color: var(--accent-color);
  animation: heroIntro 880ms cubic-bezier(.2,.9,.25,1) 100ms both;
}

@keyframes heroIntro {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.992);
    filter: blur(4px) saturate(.95);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
    filter: blur(0) saturate(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0) saturate(1);
  }
}

@media (max-width: 500px) {
  .quote-text {
    font-size: 1.2rem;
    padding: 0 5px;
  }
  .quote-series {
    font-size: 0.95rem;
    padding: 0 5px;
  }
}
</style>
<script>
import axios from 'axios';
import { getCurrentLanguage } from '@/services/translations.js';

export default {
  data() {
    return {
      quote: null,
      currentLanguage: 'en'
    };
  },
  computed: {
    formattedQuote() {
      if (!this.quote || !this.quote.text) return '';
      let text = this.quote.text;
      // Remove anything in brackets
      text = text.replace(/\[.*?\]/g, '');
      // If there's a colon, take the part after it
      const colonIndex = text.indexOf(':');
      if (colonIndex !== -1) {
        text = text.substring(colonIndex + 1).trim();
      }
      return text;
    }
  },
  methods: {
    getQuoteCacheKeys(lang) {
      return {
        quote: `dailyQuote_v5_${lang}`,
        ts: `quoteTimestamp_v5_${lang}`
      };
    },
    async loadQuote(lang) {
      const keys = this.getQuoteCacheKeys(lang);
      const cachedQuote = localStorage.getItem(keys.quote);
      const cachedTime = localStorage.getItem(keys.ts);
      const isFresh = cachedQuote && cachedTime && (Date.now() - parseInt(cachedTime, 10)) < 24 * 60 * 60 * 1000;

      if (isFresh) {
        this.quote = JSON.parse(cachedQuote);
        return;
      }

      const res = await axios.get('/api/daily-quote', {
        params: { lang }
      });
      this.quote = res.data;
      localStorage.setItem(keys.quote, JSON.stringify(this.quote));
      localStorage.setItem(keys.ts, Date.now().toString());
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.loadQuote(this.currentLanguage).catch(err => {
      console.error('Error fetching daily quote:', err);
    });

    this._languageChangedHandler = (e) => {
      this.currentLanguage = e.detail.language;
      this.loadQuote(this.currentLanguage).catch(err => {
        console.error('Error fetching daily quote:', err);
      });
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
  }
};
</script>