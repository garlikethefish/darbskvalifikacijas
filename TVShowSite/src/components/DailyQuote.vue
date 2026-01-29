<template>
    <div v-if="quote" class="quote-content"> <!-- v-if so that doesnt display elements before quote data loaded-->
        <h1 class="quote-text">"{{ quote.text }}"</h1>
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
  mounted() {
    axios.get('api/daily-quote')
      .then(res => {
        this.quote = res.data;
      });
  }
};
</script>