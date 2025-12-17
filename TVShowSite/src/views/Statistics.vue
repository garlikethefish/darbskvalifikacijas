<template>
  <div class="statistics-container">
    <h1>Site Statistics</h1>

    <!-- Site stats -->
    <div class="stats-section">
      <h2>Site-wide Stats</h2>
      <div class="stat-cards">
        <div class="stat-card">
          <strong>Highest Rated TV Show:</strong>
            <p>
                {{ siteStats.highestRated?.title || 'N/A' }} - {{ formatRating(siteStats.highestRated) }}/5
            </p>
        </div>
        <div class="stat-card">
          <strong>Lowest Rated TV Show:</strong>
          <p>
            {{ siteStats.lowestRated?.title || 'N/A' }} - {{ formatRating(siteStats.lowestRated) }}/5
          </p>
        </div>
        <div class="stat-card">
          <strong>Most Reviewed TV Show:</strong>
          <p>{{ formatReviewCount(siteStats.mostReviewed) }}</p>
        </div>
      </div>

      <div class="chart-section">
        <h3>Top Shows by Review Count</h3>
        <canvas id="siteChart"></canvas>
      </div>
    </div>

    <!-- User stats -->
    <div class="stats-section" :class="{ disabled: !isLoggedIn }">
      <h2>Your Stats</h2>
      <div v-if="!isLoggedIn" class="login-prompt">
        Login to view your stats...
      </div>
      <div v-else>
        <div class="stat-cards">
          <div class="stat-card">
            <strong>Highest Rated TV Show:</strong>
            <p>
                {{ userStats.highestRated?.title || 'N/A' }} - {{ formatRating(userStats.highestRated) }}/5
            </p>
          </div>
          <div class="stat-card">
            <strong>Lowest Rated TV Show:</strong>
            <p>
                {{ userStats.lowestRated?.title || 'N/A' }} - {{ formatRating(userStats.lowestRated) }}/5
            </p>
          </div>
          <div class="stat-card">
            <strong>Most Reviewed TV Show:</strong>
            <p>{{ formatReviewCount(userStats.mostReviewed) }}</p>
          </div>
        </div>

        <div class="chart-section">
          <h3>Your Top Shows by Review Count</h3>
          <canvas id="userChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

export default {
  data() {
    return {
      isLoggedIn: false,
      siteStats: {},
      userStats: {},
      siteChart: null,
      userChart: null,
      tmdbCache: {}
    };
  },
  mounted() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    this.isLoggedIn = !!auth?.user?.id;

    this.fetchStatistics(auth?.user?.id);
  },
  methods: {
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

        // Render charts
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
      const ctx = document.getElementById(canvasId).getContext('2d');
      if (canvasId === 'siteChart' && this.siteChart) this.siteChart.destroy();
      if (canvasId === 'userChart' && this.userChart) this.userChart.destroy();

      const chartData = {
        labels: items.map(i => i?.title || 'N/A'),
        datasets: [{
          label: 'Review Count',
          data: items.map(i => i?.review_count || 0),
          backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56'],
          borderRadius: 6
        }]
      };

      const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, stepSize: 1 }
          }
        }
      });

      if (canvasId === 'siteChart') this.siteChart = chartInstance;
      else this.userChart = chartInstance;
    },
    formatReviewCount(stat) {
      if (!stat) return 'N/A';
      return `${stat.title || 'Unknown'} (${stat.review_count || 0} reviews)`;
    }
  }
};
</script>

<style scoped>
.statistics-container { max-width: 900px; margin: 40px auto; padding: 20px; color: var(--text-color); }
.stats-section { margin-bottom: 40px; }
.stat-cards { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
.stat-card { flex: 1 1 200px; background-color: var(--dark-bg-color); padding: 15px; border-radius: 8px; text-align: center; }
.chart-section { background-color: var(--dark-bg-color); padding: 15px; border-radius: 8px; margin-top: 20px; }
.disabled { opacity: 0.5; }
.login-prompt { text-align: center; font-style: italic; color: var(--subtitle-color); }
canvas { background-color: var(--dark-bg-color); border-radius: 8px; padding: 10px; }
</style>
