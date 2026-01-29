<template>
  <div class="statistics-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1>{{ t('siteStatistics') }}</h1>
          <p class="subtitle">{{ t('browsePopular') }}</p>
        </div>
      </div>
    </header>

    <section class="stats-wrapper">
      <!-- Site-wide Stats -->
      <div class="stats-section">
        <div class="section-header">
          <h2>{{ t('siteStatistics') }}</h2>
          <p class="section-subtitle">{{ t('browsePopular') }}</p>
        </div>

        <div class="stat-cards">
          <div
            v-for="(stat, idx) in [
              { label: t('highestRated'), value: siteStats.highestRated, type: 'rating' },
              { label: t('lowestRated'), value: siteStats.lowestRated, type: 'rating' },
              { label: t('mostReviewed'), value: siteStats.mostReviewed, type: 'count' }
            ]"
            :key="idx"
            class="stat-card"
            :style="{ '--card-idx': idx }"
          >
            <div class="card-icon">
              <span v-if="stat.type === 'rating' && idx === 0">⭐</span>
              <span v-else-if="stat.type === 'rating' && idx === 1">📉</span>
              <span v-else>📊</span>
            </div>
            <div class="card-content">
              <p class="card-label">{{ stat.label }}</p>
              <p class="card-title">{{ stat.value?.title || 'N/A' }}</p>
              <p v-if="stat.type === 'rating'" class="card-value">
                {{ formatRating(stat.value) }}<span class="rating-max">/5</span>
              </p>
              <p v-else class="card-value">{{ stat.value?.review_count || 0 }} <span class="count-label">{{ t('reviews') }}</span></p>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h3>{{ t('topShowsByReviewCount') }}</h3>
          </div>
          <canvas id="siteChart"></canvas>
        </div>
      </div>

      <!-- User Stats -->
      <div class="stats-section" :class="{ locked: !isLoggedIn }">
        <div class="section-header">
          <h2>{{ t('yourPersonalStats') }}</h2>
          <p class="section-subtitle">{{ isLoggedIn ? t('yourViewingJourney') : t('signInToUnlock') }}</p>
        </div>

        <div v-if="!isLoggedIn" class="login-prompt">
          <div class="lock-icon">🔒</div>
          <h3>{{ t('loginViewStats') }}</h3>
          <p>{{ t('loginStatsDescription') }}</p>
          <router-link to="/login" class="login-btn">{{ t('signIn') }}</router-link>
        </div>

        <div v-else>
          <div class="stat-cards">
            <div
              v-for="(stat, idx) in [
                { label: t('yourFavorite'), value: userStats.highestRated, type: 'rating' },
                { label: t('notYourStyle'), value: userStats.lowestRated, type: 'rating' },
                { label: t('mostWatched'), value: userStats.mostReviewed, type: 'count' }
              ]"
              :key="idx"
              class="stat-card"
              :style="{ '--card-idx': idx }"
            >
              <div class="card-icon">
                <span v-if="stat.type === 'rating' && idx === 0">❤️</span>
                <span v-else-if="stat.type === 'rating' && idx === 1">👎</span>
                <span v-else>🎬</span>
              </div>
              <div class="card-content">
                <p class="card-label">{{ stat.label }}</p>
                <p class="card-title">{{ stat.value?.title || 'N/A' }}</p>
                <p v-if="stat.type === 'rating'" class="card-value">
                  {{ formatRating(stat.value) }}<span class="rating-max">/5</span>
                </p>
                <p v-else class="card-value">{{ stat.value?.review_count || 0 }} <span class="count-label">{{ t('reviews') }}</span></p>
              </div>
            </div>
          </div>

          <div class="chart-section">
            <div class="chart-header">
              <h3>{{ t('yourTopShowsByReviewCount') }}</h3>
            </div>
            <canvas id="userChart"></canvas>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'
Chart.register(...registerables);

export default {
  data() {
    return {
      isLoggedIn: false,
      siteStats: {},
      userStats: {},
      siteChart: null,
      userChart: null,
      tmdbCache: {},
      currentLanguage: 'en'
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    async fetchStatistics(userId) {
      try {
        const headers = {};
        if (userId) headers['Authorization'] = userId.toString();

        const res = await axios.get('/api/statistics', { headers });
        const data = res.data;

        // Fetch TMDB titles if missing
        const allSeries = [
          data.globalStats.highestRated,
          data.globalStats.lowestRated,
          data.globalStats.mostReviewed,
          ...(userId && data.userStats ? [
            data.userStats.highestRated,
            data.userStats.lowestRated,
            data.userStats.mostReviewed
          ] : [])
        ];

        await Promise.all(allSeries.map(async s => {
          if (s && s.tmdb_series_id && !this.tmdbCache[s.tmdb_series_id]) {
            try {
              const tmdbRes = await axios.get(`https://api.themoviedb.org/3/tv/${s.tmdb_series_id}`, {
                params: { api_key: import.meta.env.VITE_TMDB_API_KEY }
              });
              this.tmdbCache[s.tmdb_series_id] = tmdbRes.data.name;
            } catch {
              this.tmdbCache[s.tmdb_series_id] = 'Unknown Series';
            }
          }
          if (s) s.title = this.tmdbCache[s.tmdb_series_id] || 'Unknown Series';
        }));

        // Assign stats
        this.siteStats = data.globalStats || {};
        this.userStats = userId && data.userStats ? data.userStats : {};

        // Render charts with nextTick to ensure DOM is ready
        this.$nextTick(() => {
          this.renderChart('siteChart', [
            this.siteStats.highestRated,
            this.siteStats.lowestRated,
            this.siteStats.mostReviewed
          ]);

          if (this.isLoggedIn && data.userStats) {
            this.renderChart('userChart', [
              this.userStats.highestRated,
              this.userStats.lowestRated,
              this.userStats.mostReviewed
            ]);
          }
        });
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
      }
    },
    formatRating(stat) {
        if (!stat || stat.avg_rating == null) return '-';
        const num = Number(stat.avg_rating);
        if (isNaN(num)) return '-';
        return Math.floor(num * 10) / 10; // rounds down to 1 decimal
    },
    
    renderChart(canvasId, items) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (canvasId === 'siteChart' && this.siteChart) this.siteChart.destroy();
      if (canvasId === 'userChart' && this.userChart) this.userChart.destroy();

      const chartData = {
        labels: items.map(i => i?.title || 'N/A'),
        datasets: [{
          label: 'Review Count',
          data: items.map(i => i?.review_count || 0),
          backgroundColor: [
            'rgba(112, 233, 116, 0.8)',
            'rgba(255, 107, 107, 0.8)',
            'rgba(255, 197, 61, 0.8)'
          ],
          borderColor: [
            'rgba(112, 233, 116, 1)',
            'rgba(255, 107, 107, 1)',
            'rgba(255, 197, 61, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: [
            'rgba(112, 233, 116, 1)',
            'rgba(255, 107, 107, 1)',
            'rgba(255, 197, 61, 1)'
          ],
          hoverBorderWidth: 3
        }]
      };

      const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(112, 233, 116, 0.5)',
              borderWidth: 1,
              borderRadius: 8,
              displayColors: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              stepSize: 1,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
              },
              ticks: {
                color: 'rgba(232, 253, 222, 0.6)',
                font: { size: 12 }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: 'rgba(232, 253, 222, 0.8)',
                font: { size: 12 }
              }
            }
          }
        }
      });

      if (canvasId === 'siteChart') this.siteChart = chartInstance;
      else this.userChart = chartInstance;
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    const auth = JSON.parse(localStorage.getItem('auth'));
    this.isLoggedIn = !!auth?.user?.id;

    this.fetchStatistics(auth?.user?.id);

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

<style scoped>
.statistics-page {
  padding: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  width: 100%;
}

/* ═══════════════════════════════════════════════════════════ */
/*                     HERO SECTION                           */
/* ═══════════════════════════════════════════════════════════ */

.hero {
  margin-bottom: 2rem;
  overflow: hidden;
}

.hero-band {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  background: linear-gradient(90deg, rgba(34, 59, 75, 0.92), rgba(25, 61, 39, 0.92));
  padding: 48px 0;
  box-shadow: inset 0 -40px 60px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.hero-band::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.02) 28%,
    rgba(255, 255, 255, 0.1) 48%,
    rgba(255, 255, 255, 0.02) 72%,
    rgba(255, 255, 255, 0) 100%
  );
  mix-blend-mode: overlay;
  pointer-events: none;
  transform: translateX(-80%);
  animation: shimmerSlide 3200ms cubic-bezier(0.22, 0.1, 0.25, 1) infinite;
  opacity: 0.95;
}

@keyframes shimmerSlide {
  0% {
    transform: translateX(-80%);
    opacity: 0.45;
  }
  50% {
    transform: translateX(0%);
    opacity: 1;
  }
  100% {
    transform: translateX(80%);
    opacity: 0.45;
  }
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-inner h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  font-weight: 800;
  color: var(--text-color);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.hero-inner .subtitle {
  margin: 0;
  color: var(--subtitle-color);
  font-size: clamp(0.95rem, 1.6vw, 1.1rem);
  opacity: 0.95;
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) 100ms both;
}

@keyframes heroIntro {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.992);
    filter: blur(4px) saturate(0.95);
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

/* ═══════════════════════════════════════════════════════════ */
/*                  STATS WRAPPER & SECTIONS                  */
/* ═══════════════════════════════════════════════════════════ */

.stats-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.25rem 2rem;
  box-sizing: border-box;
}

.stats-section {
  margin-bottom: 3.5rem;
  animation: fadeInSection 600ms cubic-bezier(0.16, 0.84, 0.24, 1) forwards;
  opacity: 0;
}

.stats-section:nth-child(1) {
  animation-delay: 0ms;
}

.stats-section:nth-child(2) {
  animation-delay: 100ms;
}

@keyframes fadeInSection {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-section.locked {
  opacity: 0.7;
  pointer-events: none;
}

/* ═══════════════════════════════════════════════════════════ */
/*                  SECTION HEADERS                           */
/* ═══════════════════════════════════════════════════════════ */

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin: 0 0 6px 0;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.3px;
}

.section-subtitle {
  margin: 0;
  color: var(--subtitle-color);
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  opacity: 0.85;
}

/* ═══════════════════════════════════════════════════════════ */
/*                    STAT CARDS                              */
/* ═══════════════════════════════════════════════════════════ */

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, var(--section-dark-color) 100%);
  border: 1px solid rgba(112, 233, 116, 0.1);
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 300ms cubic-bezier(0.2, 0.9, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: cardSlideIn 500ms cubic-bezier(0.16, 0.84, 0.24, 1) forwards;
  opacity: 0;
  animation-delay: calc(var(--card-idx) * 80ms);
}

@keyframes cardSlideIn {
  0% {
    opacity: 0;
    transform: translateY(16px) rotateX(8deg);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
    filter: blur(0);
  }
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(112, 233, 116, 0.08) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
}

.stat-card:hover {
  border-color: rgba(112, 233, 116, 0.3);
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(112, 233, 116, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(112, 233, 116, 0.08);
  border-radius: 12px;
  flex-shrink: 0;
  animation: iconBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  animation-delay: calc(var(--card-idx) * 80ms + 200ms);
}

@keyframes iconBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) rotateZ(-30deg);
  }
  70% {
    transform: scale(1.1) rotateZ(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateZ(0deg);
  }
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  margin: 0;
  font-size: 0.85rem;
  color: var(--subtitle-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.card-title {
  margin: 6px 0 8px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-value {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent-color);
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.rating-max {
  font-size: 1rem;
  opacity: 0.6;
  font-weight: 600;
}

.count-label {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.7;
  margin-left: 2px;
}

/* ═══════════════════════════════════════════════════════════ */
/*                   CHART SECTION                            */
/* ═══════════════════════════════════════════════════════════ */

.chart-section {
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, var(--section-dark-color) 100%);
  border: 1px solid rgba(112, 233, 116, 0.1);
  border-radius: 14px;
  padding: 1.75rem;
  animation: cardSlideIn 500ms cubic-bezier(0.16, 0.84, 0.24, 1) 160ms forwards;
  opacity: 0;
  position: relative;
  overflow: hidden;
}

.chart-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(112, 233, 116, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.2px;
}

canvas {
  max-height: 300px;
  position: relative;
  z-index: 2;
}

/* ═══════════════════════════════════════════════════════════ */
/*                   LOGIN PROMPT                             */
/* ═══════════════════════════════════════════════════════════ */

.login-prompt {
  text-align: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, var(--section-dark-color) 100%);
  border: 1.5px dashed rgba(112, 233, 116, 0.2);
  border-radius: 14px;
  animation: fadeInSection 600ms cubic-bezier(0.16, 0.84, 0.24, 1) 200ms forwards;
  opacity: 0;
}

.lock-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  display: inline-block;
  animation: lockBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  animation-delay: 250ms;
}

@keyframes lockBounce {
  0% {
    opacity: 0;
    transform: scale(0.2) translateY(-20px);
  }
  70% {
    transform: scale(1.15) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.login-prompt h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: var(--text-color);
  font-weight: 700;
}

.login-prompt p {
  margin: 0 0 1.5rem 0;
  color: var(--subtitle-color);
  opacity: 0.85;
  font-size: 0.95rem;
}

.login-btn {
  display: inline-block;
  padding: 0.85rem 1.5rem;
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  transition: all 300ms cubic-bezier(0.2, 0.9, 0.2, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(112, 233, 116, 0.2);
  pointer-events: auto;
  cursor: pointer;
}

.login-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(112, 233, 116, 0.15);
  border-color: rgba(112, 233, 116, 0.4);
}

.login-btn:active {
  transform: translateY(-2px);
}

/* ═══════════════════════════════════════════════════════════ */
/*                   RESPONSIVE DESIGN                        */
/* ═══════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .stats-wrapper {
    padding: 0 1rem 1.5rem;
  }

  .hero-band {
    padding: 32px 0;
    box-shadow: inset 0 -30px 40px rgba(0, 0, 0, 0.25);
  }

  .hero-inner h1 {
    font-size: 1.7rem;
  }

  .stats-section {
    margin-bottom: 2.5rem;
  }

  .stat-cards {
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.25rem;
    flex-direction: column;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-value {
    font-size: 1.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
