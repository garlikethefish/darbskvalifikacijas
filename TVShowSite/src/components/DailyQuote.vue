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
  font-size: clamp(2rem, 4vw, 3rem);
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

export default {
  data() {
    return {
      quote: null
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
  mounted() {
    const cachedQuote = localStorage.getItem('dailyQuote_v3');
    const cachedTime = localStorage.getItem('quoteTimestamp_v3');
    if (cachedQuote && cachedTime && (Date.now() - parseInt(cachedTime)) < 24 * 60 * 60 * 1000) {
      this.quote = JSON.parse(cachedQuote);
    } else {
      axios.get('api/daily-quote')
        .then(res => {
          this.quote = res.data;
          localStorage.setItem('dailyQuote_v3', JSON.stringify(this.quote));
          localStorage.setItem('quoteTimestamp_v3', Date.now().toString());
        })
        .catch(err => {
          console.error('Error fetching daily quote:', err);
        });
    }
  }
};
</script>