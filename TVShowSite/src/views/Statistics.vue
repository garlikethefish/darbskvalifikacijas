<template>
  <div class="stats-page">

    <!-- ── Hero ── -->
    <section class="hero" ref="hero">
      <div class="hero-wave" aria-hidden="true"></div>
      <div class="hero-chart-line" aria-hidden="true">
        <svg class="hero-chart-svg" viewBox="0 0 2400 170" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs></defs>
          <!-- tile 1: ECG heartbeat — flat baseline, sharp dip, tall spike, rebound, flat -->
          <path fill="rgba(255,255,255,0.012)" d="
            M0,88
            L62,88 L70,110 L80,24 L90,152 L98,84 L130,84
            L175,84 L180,92 L188,58 L194,140 L200,80 L240,80
            L310,80 L318,98 L326,12 L338,158 L348,76 L390,76
            L430,76 L436,86 L445,68 L452,104 L460,78 L500,78
            L558,78 L564,116 L574,18 L586,148 L596,82 L640,82
            L685,82 L692,94 L700,44 L710,136 L718,88 L745,88
            L800,88 L808,72 L818,8 L830,162 L840,84 L880,84
            L920,84 L926,108 L934,50 L944,130 L952,80 L990,80
            L1045,80 L1052,90 L1062,26 L1074,154 L1084,78 L1120,78
            L1160,78 L1165,96 L1174,62 L1182,120 L1190,82 L1200,82
            L1200,170 L0,170 Z"/>
          <path fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.6" stroke-linejoin="miter" stroke-linecap="square" d="
            M0,88
            L62,88 L70,110 L80,24 L90,152 L98,84 L130,84
            L175,84 L180,92 L188,58 L194,140 L200,80 L240,80
            L310,80 L318,98 L326,12 L338,158 L348,76 L390,76
            L430,76 L436,86 L445,68 L452,104 L460,78 L500,78
            L558,78 L564,116 L574,18 L586,148 L596,82 L640,82
            L685,82 L692,94 L700,44 L710,136 L718,88 L745,88
            L800,88 L808,72 L818,8 L830,162 L840,84 L880,84
            L920,84 L926,108 L934,50 L944,130 L952,80 L990,80
            L1045,80 L1052,90 L1062,26 L1074,154 L1084,78 L1120,78
            L1160,78 L1165,96 L1174,62 L1182,120 L1190,82 L1200,82"/>
          <!-- tile 2: different beat pattern for seamless loop -->
          <path fill="rgba(255,255,255,0.012)" d="
            M1200,82
            L1255,82 L1262,106 L1272,30 L1282,150 L1290,86 L1325,86
            L1370,86 L1376,78 L1386,16 L1398,160 L1408,80 L1450,80
            L1495,80 L1502,100 L1512,54 L1522,138 L1530,82 L1565,82
            L1605,82 L1612,90 L1622,42 L1632,128 L1640,84 L1680,84
            L1730,84 L1736,112 L1746,22 L1758,156 L1768,78 L1810,78
            L1855,78 L1860,88 L1870,60 L1878,116 L1886,80 L1920,80
            L1965,80 L1972,70 L1982,10 L1994,164 L2004,82 L2045,82
            L2090,82 L2097,96 L2106,36 L2118,146 L2128,76 L2165,76
            L2210,76 L2216,102 L2226,48 L2236,132 L2244,84 L2280,84
            L2340,84 L2346,90 L2358,32 L2370,154 L2380,88 L2400,88
            L2400,170 L1200,170 Z"/>
          <path fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.6" stroke-linejoin="miter" stroke-linecap="square" d="
            M1200,82
            L1255,82 L1262,106 L1272,30 L1282,150 L1290,86 L1325,86
            L1370,86 L1376,78 L1386,16 L1398,160 L1408,80 L1450,80
            L1495,80 L1502,100 L1512,54 L1522,138 L1530,82 L1565,82
            L1605,82 L1612,90 L1622,42 L1632,128 L1640,84 L1680,84
            L1730,84 L1736,112 L1746,22 L1758,156 L1768,78 L1810,78
            L1855,78 L1860,88 L1870,60 L1878,116 L1886,80 L1920,80
            L1965,80 L1972,70 L1982,10 L1994,164 L2004,82 L2045,82
            L2090,82 L2097,96 L2106,36 L2118,146 L2128,76 L2165,76
            L2210,76 L2216,102 L2226,48 L2236,132 L2244,84 L2280,84
            L2340,84 L2346,90 L2358,32 L2370,154 L2380,88 L2400,88"/>
        </svg>
      </div>
      <div class="hero-inner">
        <div class="hero-text">
          <h1>{{ t('siteStatistics') }}</h1>
          <p>{{ t('browsePopular') }}</p>
        </div>
      </div>
    </section>

    <!-- ── Stats Frame: clips gradient + panel to same rounded rect ── -->
    <div class="stats-frame">
      <div class="glass-gradient" aria-hidden="true"></div>

    <!-- ── Stats Canvas (background panel) ── -->
    <div class="stats-canvas">

    <!-- ── Site Section Header ── -->
    <div class="section-divider section-site reveal" data-delay="0">
      <div class="sd-inner sd-float">
        <div class="sd-icon"><SvgIcon name="globe" :size="18" /></div>
        <div>
          <div class="sd-title">{{ t('siteStatistics') }}</div>
          <div class="sd-sub">{{ t('browsePopular') }}</div>
        </div>
      </div>
    </div>

    <!-- ── Top KPI Cards ── -->
    <div class="kpi-row">
      <div class="kpi-card kpi-green reveal" data-delay="0">
        <div class="kpi-top">
          <div class="kpi-label">{{ t('highestRated') }}</div>
          <div class="kpi-icon"><SvgIcon name="crown" :size="20" /></div>
        </div>
        <div class="kpi-value">{{ formatRating(siteStats.highestRated) }}<span class="kpi-unit">/5</span></div>
        <div class="kpi-name">{{ siteStats.highestRated?.title || '—' }}</div>
        <div class="kpi-wave">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"><path d="M0,30 C30,10 60,45 90,25 C120,5 150,40 180,20 L200,20 L200,50 L0,50Z" fill="rgba(112,233,116,0.25)"/><path d="M0,35 C40,15 70,48 110,28 C140,12 170,38 200,22" fill="none" stroke="rgba(112,233,116,0.7)" stroke-width="2"/></svg>
        </div>
      </div>

      <div class="kpi-card kpi-teal reveal" data-delay="80">
        <div class="kpi-top">
          <div class="kpi-label">{{ t('mostReviewed') }}</div>
          <div class="kpi-icon"><SvgIcon name="fire" :size="20" /></div>
        </div>
        <div class="kpi-value">{{ siteStats.mostReviewed?.review_count || 0 }}<span class="kpi-unit"> {{ t('reviews') }}</span></div>
        <div class="kpi-name">{{ siteStats.mostReviewed?.title || '—' }}</div>
        <div class="kpi-wave">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"><path d="M0,28 C25,12 55,44 85,24 C115,4 145,38 175,18 L200,18 L200,50 L0,50Z" fill="rgba(70,210,150,0.25)"/><path d="M0,32 C35,14 65,46 100,26 C130,8 165,42 200,20" fill="none" stroke="rgba(70,210,150,0.7)" stroke-width="2"/></svg>
        </div>
      </div>

      <div class="kpi-card kpi-orange reveal" data-delay="160">
        <div class="kpi-top">
          <div class="kpi-label">{{ t('lowestRated') }}</div>
          <div class="kpi-icon"><SvgIcon name="arrow-down" :size="20" /></div>
        </div>
        <div class="kpi-value">{{ formatRating(siteStats.lowestRated) }}<span class="kpi-unit">/5</span></div>
        <div class="kpi-name">{{ siteStats.lowestRated?.title || '—' }}</div>
        <div class="kpi-wave">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"><path d="M0,32 C30,18 60,46 90,28 C120,10 150,44 180,24 L200,24 L200,50 L0,50Z" fill="rgba(60,190,120,0.25)"/><path d="M0,36 C40,18 70,48 110,30 C140,14 170,40 200,24" fill="none" stroke="rgba(60,190,120,0.7)" stroke-width="2"/></svg>
        </div>
      </div>

      <div class="kpi-card kpi-blue reveal" data-delay="240">
        <div class="kpi-top">
          <div class="kpi-label">{{ t('siteAverage') }}</div>
          <div class="kpi-icon"><SvgIcon name="star" :size="20" /></div>
        </div>
        <div class="kpi-value">{{ siteAvg }}<span class="kpi-unit">/5</span></div>
        <div class="kpi-name">{{ t('across') }} {{ totalReviews }} {{ t('reviews') }}</div>
        <div class="kpi-wave">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"><path d="M0,26 C28,10 58,42 88,22 C118,2 148,38 178,18 L200,18 L200,50 L0,50Z" fill="rgba(80,220,140,0.25)"/><path d="M0,30 C38,12 68,44 108,24 C138,6 168,36 200,18" fill="none" stroke="rgba(80,220,140,0.7)" stroke-width="2"/></svg>
        </div>
      </div>
    </div>

    <!-- ── Middle Row: Doughnut + Area Chart ── -->
    <div class="mid-row">
      <div class="panel panel-donut reveal" data-delay="0">
        <div class="panel-hd">
          <span class="panel-title">{{ t('eventStatistics') }}</span>
        </div>
        <div class="donut-wrap">
          <canvas id="donutChart"></canvas>
          <div class="donut-center">
            <span class="donut-val">{{ totalReviews }}</span>
            <span class="donut-lbl">{{ t('total') }}</span>
          </div>
        </div>
        <div class="donut-legend">
          <div class="dl-row"><span class="dl-dot green"></span><span>{{ siteStats.highestRated?.title || 'Highest Rated' }}</span></div>
          <div class="dl-row"><span class="dl-dot teal"></span><span>{{ siteStats.mostReviewed?.title || 'Most Reviewed' }}</span></div>
          <div class="dl-row"><span class="dl-dot orange"></span><span>{{ siteStats.lowestRated?.title || 'Lowest Rated' }}</span></div>
        </div>
      </div>

      <div class="panel panel-area reveal" data-delay="80">
        <div class="panel-hd">
          <span class="panel-title">{{ t('topShowsByReviewCount') }}</span>
          <div class="panel-legend">
            <span class="leg-dot green"></span><span class="leg-lbl">{{ t('site') }}</span>
          <template v-if="isLoggedIn && hasEnoughReviews">
              <span class="leg-dot teal"></span><span class="leg-lbl">{{ t('you') }}</span>
            </template>
          </div>
        </div>
        <div class="chart-wrap"><canvas id="siteChart"></canvas></div>
      </div>
    </div>

    <!-- ── User Section Header ── -->
    <div class="section-divider section-user reveal" data-delay="0">
      <div class="sd-inner sd-float">
        <div class="sd-icon sd-icon-user"><SvgIcon name="user" :size="18" /></div>
        <div>
          <div class="sd-title">{{ t('yourPersonalStats') }}</div>
          <div class="sd-sub">{{ isLoggedIn ? (hasEnoughReviews ? t('yourViewingJourney') : t('reviewsNeeded')) : t('signInToUnlock') }}</div>
        </div>
        <div v-if="isLoggedIn && hasEnoughReviews" style="margin-left:12px">
          <button class="pdf-btn" :disabled="generatingPdf" @click="downloadStatsPdf">
            <span v-if="generatingPdf">{{ t('Generating') || 'Generating...' }}</span>
            <span v-else>{{ t('Download PDF') || 'Download PDF' }}</span>
          </button>
        </div>
        <div v-if="!isLoggedIn" class="sd-lock"><SvgIcon name="lock" :size="16" /></div>
      </div>
    </div>

    <!-- ── Bottom Row ── -->
    <div class="bot-row" id="userExportArea">
      <div class="panel panel-profit reveal" data-delay="0">
        <div class="panel-hd">
          <span class="panel-title">{{ isLoggedIn ? t('yourTopShowsByReviewCount') : t('yourPersonalStats') }}</span>
        </div>
        <div v-if="!isLoggedIn" class="login-prompt">
          <div class="lp-icon"><SvgIcon name="lock" :size="32" /></div>
          <p>{{ t('loginViewStats') }}</p>
          <router-link to="/login" class="lp-btn">
            <SvgIcon name="lock-open" :size="14" /> {{ t('signIn') }}
          </router-link>
        </div>
        <div v-else-if="!hasEnoughReviews" class="login-prompt">
          <div class="lp-icon"><SvgIcon name="star" :size="32" /></div>
          <p>{{ t('needFiveReviews') }}</p>
        </div>
        <div v-else class="chart-wrap"><canvas id="profitChart"></canvas></div>
      </div>

      <div class="panel panel-bar reveal" data-delay="80">
        <div class="panel-hd">
          <span class="panel-title">{{ t('yourPersonalStats') }}</span>
        </div>
        <div v-if="!isLoggedIn" class="login-prompt">
          <div class="lp-icon"><SvgIcon name="lock" :size="32" /></div>
          <p>{{ t('signInToUnlock') }}</p>
          <router-link to="/login" class="lp-btn">
            <SvgIcon name="lock-open" :size="14" /> {{ t('signIn') }}
          </router-link>
        </div>
        <div v-else-if="!hasEnoughReviews" class="login-prompt">
          <div class="lp-icon"><SvgIcon name="star" :size="32" /></div>
          <p>{{ t('needFiveReviews') }}</p>
        </div>
        <div v-else>
          <div class="user-kpis">
            <div class="uk-item uk-green">
              <div class="uk-val">{{ formatRating(userStats.highestRated) }}/5</div>
              <div class="uk-lbl">{{ t('yourFavorite') }}</div>
              <div class="uk-name">{{ userStats.highestRated?.title || '—' }}</div>
            </div>
            <div class="uk-item uk-teal">
              <div class="uk-val">{{ userStats.mostReviewed?.review_count || 0 }}</div>
              <div class="uk-lbl">{{ t('mostWatched') }}</div>
              <div class="uk-name">{{ userStats.mostReviewed?.title || '—' }}</div>
            </div>
            <div class="uk-item uk-orange">
              <div class="uk-val">{{ formatRating(userStats.lowestRated) }}/5</div>
              <div class="uk-lbl">{{ t('notYourStyle') }}</div>
              <div class="uk-name">{{ userStats.lowestRated?.title || '—' }}</div>
            </div>
          </div>
          <div class="chart-wrap chart-bar-wrap"><canvas id="userBarChart"></canvas></div>
        </div>
      </div>
    </div>

    </div><!-- /stats-canvas -->

    </div><!-- /stats-frame -->

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';
import SvgIcon from '@/components/SvgIcon.vue';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
Chart.register(...registerables);

export default {
  components: { SvgIcon },
  data() {
    return {
      isLoggedIn: false,
      hasEnoughReviews: false,
        generatingPdf: false,
      siteStats: {},
      userStats: {},
      donutChart: null,
      siteChart: null,
      profitChart: null,
      userBarChart: null,
      tmdbCache: {},
      currentLanguage: 'en',
      _observer: null,
    };
  },
  computed: {
    siteAvg() {
      const items = [this.siteStats.highestRated, this.siteStats.lowestRated].filter(i => i && i.avg_rating != null);
      if (!items.length) return '-';
      const avg = items.reduce((s, i) => s + Number(i.avg_rating), 0) / items.length;
      return Math.floor(avg * 10) / 10;
    },
    totalReviews() {
      return [this.siteStats.highestRated, this.siteStats.lowestRated, this.siteStats.mostReviewed]
        .filter(Boolean).reduce((s, i) => s + (i.review_count || 0), 0);
    },
  },
  methods: {
    t(key) { return getTranslation(key, this.currentLanguage); },

    formatRating(stat) {
      if (!stat || stat.avg_rating == null) return '-';
      const n = Number(stat.avg_rating);
      return isNaN(n) ? '-' : Math.floor(n * 10) / 10;
    },

    async fetchStatistics(userId) {
      try {
        const headers = {};
        if (userId) headers['Authorization'] = userId.toString();
        const res = await axios.get('/api/statistics', { headers });
        const data = res.data;

        const allSeries = [
          data.globalStats.highestRated,
          data.globalStats.lowestRated,
          data.globalStats.mostReviewed,
          ...(userId && data.userStats ? [data.userStats.highestRated, data.userStats.lowestRated, data.userStats.mostReviewed] : [])
        ].filter(Boolean);

        await Promise.all(allSeries.map(async s => {
          if (s.tmdb_series_id && !this.tmdbCache[s.tmdb_series_id]) {
            try {
              const r = await axios.get(`/api/tmdb/series/${s.tmdb_series_id}`, { params: { lang: this.currentLanguage } });
              this.tmdbCache[s.tmdb_series_id] = r.data.name;
            } catch { this.tmdbCache[s.tmdb_series_id] = 'Unknown'; }
          }
          s.title = this.tmdbCache[s.tmdb_series_id] || 'Unknown';
        }));

        this.siteStats = data.globalStats || {};
        this.userStats = (userId && data.userStats) ? data.userStats : {};
        this.hasEnoughReviews = !!(userId && data.userStats);

        this.$nextTick(() => {
          this.renderDonut();
          this.renderSiteChart();
          if (this.isLoggedIn && this.hasEnoughReviews) {
            this.renderProfitChart();
            this.renderUserBarChart();
          }
        });
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
      }
    },

    renderDonut() {
      const canvas = document.getElementById('donutChart');
      if (!canvas) return;
      if (this.donutChart) this.donutChart.destroy();
      const ctx = canvas.getContext('2d');

      const hr = Number(this.siteStats.highestRated?.avg_rating) || 0;
      const mr = Number(this.siteStats.mostReviewed?.review_count) || 0;
      const lr = Number(this.siteStats.lowestRated?.avg_rating) || 0;

      this.donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [
            this.siteStats.highestRated?.title || 'Highest',
            this.siteStats.mostReviewed?.title || 'Most Reviewed',
            this.siteStats.lowestRated?.title || 'Lowest',
          ],
          datasets: [{
            data: [Math.max(hr, 0.1), Math.max(mr / 10, 0.1), Math.max(lr, 0.1)],
            backgroundColor: ['rgba(112,233,116,0.85)', 'rgba(70,210,150,0.85)', 'rgba(60,190,120,0.85)'],
            borderColor: ['rgba(112,233,116,1)', 'rgba(70,210,150,1)', 'rgba(60,190,120,1)'],
            borderWidth: 2,
            hoverOffset: 10,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: { legend: { display: false }, tooltip: this._tooltipStyle() },
        }
      });
    },

    renderSiteChart() {
      const canvas = document.getElementById('siteChart');
      if (!canvas) return;
      if (this.siteChart) this.siteChart.destroy();
      const ctx = canvas.getContext('2d');

      const items = [this.siteStats.highestRated, this.siteStats.mostReviewed, this.siteStats.lowestRated].filter(Boolean);
      const labels = items.map(i => i.title || 'N/A');

      const gradGreen = ctx.createLinearGradient(0, 0, 0, 220);
      gradGreen.addColorStop(0, 'rgba(112,233,116,0.45)');
      gradGreen.addColorStop(1, 'rgba(112,233,116,0.0)');

      const gradTeal = ctx.createLinearGradient(0, 0, 0, 220);
      gradTeal.addColorStop(0, 'rgba(70,210,150,0.35)');
      gradTeal.addColorStop(1, 'rgba(70,210,150,0.0)');

      const userItems = (this.isLoggedIn && this.hasEnoughReviews) ? [this.userStats.highestRated, this.userStats.mostReviewed, this.userStats.lowestRated].filter(Boolean) : [];

      const datasets = [{
        label: this.t('site'),
        data: items.map(i => i.review_count || 0),
        borderColor: 'rgba(112,233,116,1)',
        backgroundColor: gradGreen,
        borderWidth: 2.5,
        tension: 0.45,
        fill: true,
        pointBackgroundColor: 'rgba(112,233,116,1)',
        pointRadius: 5,
        pointHoverRadius: 8,
      }];

      if (this.isLoggedIn && this.hasEnoughReviews) {
        datasets.push({
          label: this.t('you'),
          data: items.map((_, i) => userItems[i]?.review_count || 0),
          borderColor: 'rgba(70,210,150,1)',
          backgroundColor: gradTeal,
          borderWidth: 2,
          tension: 0.45,
          fill: true,
          pointBackgroundColor: 'rgba(70,210,150,1)',
          pointRadius: 5,
          pointHoverRadius: 8,
        });
      }

      this.siteChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: { legend: { display: false }, tooltip: this._tooltipStyle() },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(232,253,222,0.45)', font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { color: 'rgba(232,253,222,0.6)', font: { size: 11 } } }
          }
        }
      });
    },

    renderProfitChart() {
      const canvas = document.getElementById('profitChart');
      if (!canvas) return;
      if (this.profitChart) this.profitChart.destroy();
      const ctx = canvas.getContext('2d');

      const items = [this.userStats.highestRated, this.userStats.mostReviewed, this.userStats.lowestRated].filter(Boolean);
      if (!items.length) return;

      const grad = ctx.createLinearGradient(0, 0, canvas.offsetWidth || 500, 0);
      grad.addColorStop(0, 'rgba(34,59,75,0.9)');
      grad.addColorStop(0.4, 'rgba(112,233,116,0.7)');
      grad.addColorStop(0.75, 'rgba(70,210,150,0.65)');
      grad.addColorStop(1, 'rgba(60,190,120,0.85)');

      this.profitChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: items.map(i => i.title || 'N/A'),
          datasets: [{
            data: items.map(i => i.review_count || 0),
            borderColor: 'rgba(255,255,255,0.6)',
            backgroundColor: grad,
            borderWidth: 2,
            tension: 0.5,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1200, easing: 'easeOutQuart' },
          plugins: { legend: { display: false }, tooltip: this._tooltipStyle() },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(232,253,222,0.45)', font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { color: 'rgba(232,253,222,0.6)', font: { size: 11 } } }
          }
        }
      });
    },

    renderUserBarChart() {
      const canvas = document.getElementById('userBarChart');
      if (!canvas) return;
      if (this.userBarChart) this.userBarChart.destroy();
      const ctx = canvas.getContext('2d');

      const items = [this.userStats.highestRated, this.userStats.mostReviewed, this.userStats.lowestRated].filter(Boolean);
      if (!items.length) return;

      const gradGreen = ctx.createLinearGradient(0, 0, 0, 160);
      gradGreen.addColorStop(0, 'rgba(112,233,116,0.9)');
      gradGreen.addColorStop(1, 'rgba(112,233,116,0.2)');

      const gradTeal = ctx.createLinearGradient(0, 0, 0, 160);
      gradTeal.addColorStop(0, 'rgba(70,210,150,0.9)');
      gradTeal.addColorStop(1, 'rgba(70,210,150,0.2)');

      this.userBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: items.map(i => i.title || 'N/A'),
          datasets: [
            {
              label: 'Avg Rating (/5)',
              data: items.map(i => Math.max(Number(i.avg_rating) || 0, 0)),
              backgroundColor: gradGreen,
              borderColor: 'rgba(112,233,116,1)',
              borderWidth: 1.5,
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: 'Reviews',
              data: items.map(i => i.review_count || 0),
              backgroundColor: gradTeal,
              borderColor: 'rgba(70,210,150,1)',
              borderWidth: 1.5,
              borderRadius: 6,
              borderSkipped: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1000, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: true, labels: { color: 'rgba(232,253,222,0.6)', font: { size: 11 }, boxWidth: 12, boxHeight: 12 } },
            tooltip: this._tooltipStyle()
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(232,253,222,0.45)', font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { color: 'rgba(232,253,222,0.6)', font: { size: 11 } } }
          }
        }
      });
    },

    _tooltipStyle() {
      return {
        backgroundColor: 'rgba(18,20,20,0.95)',
        padding: 12,
        titleColor: '#e8fdde',
        bodyColor: '#cedfc6',
        borderColor: 'rgba(112,233,116,0.3)',
        borderWidth: 1,
        borderRadius: 8,
        displayColors: false,
        titleFont: { size: 13, weight: '700' },
        bodyFont: { size: 12 },
      };
    },

    async downloadStatsPdf() {
      if (!this.isLoggedIn || !this.hasEnoughReviews) return;
      try {
        this.generatingPdf = true;
        await this.$nextTick();

        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const username = auth?.user?.username || 'user';
        const filename = `TVshow-Personal-Stats-${username}-${new Date().toISOString().slice(0,10)}.pdf`;

        // Build a clean, printable export element (white background, tidy layout)
        const exportEl = document.createElement('div');
        exportEl.style.boxSizing = 'border-box';
        exportEl.style.padding = '22px';
        exportEl.style.background = '#ffffff';
        exportEl.style.color = '#111';
        exportEl.style.width = '1000px';
        exportEl.style.fontFamily = 'Helvetica, Arial, sans-serif';
        exportEl.style.fontSize = '13px';

        // Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '12px';
        header.innerHTML = `
          <div>
            <div style="font-size:20px;font-weight:800;color:#2b6f47">${this.t('yourPersonalStats')}</div>
            <div style="font-size:12px;color:#666;margin-top:6px">${this.t('yourViewingJourney')}</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#666">${username}<br>${new Date().toLocaleDateString()}</div>
        `;
        exportEl.appendChild(header);

        // User KPI row (simple cards)
        const kpiRow = document.createElement('div');
        kpiRow.style.display = 'flex';
        kpiRow.style.gap = '12px';
        kpiRow.style.marginBottom = '14px';

        const us = this.userStats || {};
        const makeKpi = (label, value, color) => {
          const card = document.createElement('div');
          card.style.flex = '1';
          card.style.padding = '10px';
          card.style.borderRadius = '10px';
          card.style.background = '#f6fff7';
          card.style.border = '1px solid rgba(0,0,0,0.06)';
          card.innerHTML = `<div style="font-weight:800;font-size:16px;color:${color}">${value}</div><div style="font-size:11px;color:#444;margin-top:6px">${label}</div>`;
          return card;
        };

        kpiRow.appendChild(makeKpi(this.t('yourFavorite') || 'Favorite', `${this.formatRating(us.highestRated)}/5`, '#2b6f47'));
        kpiRow.appendChild(makeKpi(this.t('mostWatched') || 'Most Watched', `${us.mostReviewed?.review_count || 0}`, '#177f6b'));
        kpiRow.appendChild(makeKpi(this.t('notYourStyle') || 'Not your style', `${this.formatRating(us.lowestRated)}/5`, '#c96b2b'));
        exportEl.appendChild(kpiRow);

        // Helper: render an existing canvas to a dataURL at higher resolution
        // Preserves chart contrast by painting the chart panel background
        const canvasToDataUrl = (canvas, targetWidth = 920) => {
          if (!canvas) return null;
          const rect = canvas.getBoundingClientRect();
          const cssW = Math.max(1, Math.round(rect.width));
          const cssH = Math.max(1, Math.round(rect.height));
          const scale = Math.max(2, Math.ceil(targetWidth / cssW));
          const temp = document.createElement('canvas');
          temp.width = cssW * scale;
          temp.height = cssH * scale;
          const tctx = temp.getContext('2d');

          // Determine a solid background color from the nearest panel (fallback to dark)
          let bgColor = '#06140a';
          try {
            const panelEl = canvas.closest && canvas.closest('.panel') || canvas.parentElement || document.body;
            const cs = window.getComputedStyle(panelEl);
            let styleBg = cs && (cs.backgroundColor || cs.getPropertyValue('background-color')) || '';
            if (styleBg && styleBg !== 'transparent') {
              const m = styleBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9\.]+))?\)/);
              if (m) {
                const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
                bgColor = `rgb(${r}, ${g}, ${b})`;
              } else {
                bgColor = styleBg;
              }
            }
          } catch (e) {
            /* ignore and use fallback */
          }

          tctx.fillStyle = bgColor;
          tctx.fillRect(0, 0, temp.width, temp.height);

          // draw using the canvas's internal pixel size to preserve clarity
          const srcW = canvas.width || cssW;
          const srcH = canvas.height || cssH;
          tctx.drawImage(canvas, 0, 0, srcW, srcH, 0, 0, temp.width, temp.height);
          return temp.toDataURL('image/png');
        };

        // Attach charts (profit + userBar) as high-res images
        const chartIds = ['profitChart', 'userBarChart'];
        for (const id of chartIds) {
          const c = this.$el.querySelector(`#${id}`);
          if (c) {
            const dataUrl = canvasToDataUrl(c, 920);
            if (dataUrl) {
              const img = new Image();
              img.src = dataUrl;
              img.style.width = '100%';
              img.style.display = 'block';
              img.style.marginBottom = '12px';
              exportEl.appendChild(img);
            }
          }
        }

        // Place the export element off-screen for rendering
        exportEl.style.position = 'fixed';
        exportEl.style.left = '-9999px';
        document.body.appendChild(exportEl);

        // Allow images to settle
        await new Promise(r => setTimeout(r, 120));

        // Render exportEl to a canvas and then split into A4 pages if needed
        const rendered = await html2canvas(exportEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = rendered.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth() - 20; // margin
        const pdfH = pdf.internal.pageSize.getHeight() - 20;

        const imgWpx = rendered.width;
        const imgHpx = rendered.height;
        const pxToPt = pdfW / imgWpx; // scale factor from canvas px to PDF pt
        const renderedHeightPt = imgHpx * pxToPt;

        if (renderedHeightPt <= pdfH) {
          pdf.addImage(imgData, 'PNG', 10, 10, pdfW, renderedHeightPt);
        } else {
          // slice vertically into pages
          let position = 0;
          const pageHeightPx = Math.floor(pdfH / pxToPt);
          while (position < imgHpx) {
            const sliceH = Math.min(pageHeightPx, imgHpx - position);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = imgWpx;
            sliceCanvas.height = sliceH;
            const sctx = sliceCanvas.getContext('2d');
            sctx.drawImage(rendered, 0, position, imgWpx, sliceH, 0, 0, imgWpx, sliceH);
            const sliceData = sliceCanvas.toDataURL('image/png');
            const sliceHpt = sliceH * pxToPt;
            pdf.addImage(sliceData, 'PNG', 10, 10, pdfW, sliceHpt);
            position += sliceH;
            if (position < imgHpx) pdf.addPage();
          }
        }

        pdf.save(filename);
        document.body.removeChild(exportEl);
      } catch (err) {
        console.error('PDF generation failed', err);
        alert(this.t('pdfFailed') || 'Failed to generate PDF');
      } finally {
        this.generatingPdf = false;
      }
    },

    initParallax() {
      const els = this.$el.querySelectorAll('.reveal');
      if (!els.length) return;
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const delay = Number(e.target.dataset.delay) || 0;
            setTimeout(() => e.target.classList.add('revealed'), delay);
            this._observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(el => this._observer.observe(el));
    },

    initTilt() {
      const cards = this.$el.querySelectorAll('.kpi-card, .panel, .sd-inner');
      this._tiltHandlers = [];

      cards.forEach(card => {
        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--gx', `${e.clientX - rect.left}px`);
          card.style.setProperty('--gy', `${e.clientY - rect.top}px`);
        };
        const onLeave = () => {
          card.style.setProperty('--gx', '-500px');
          card.style.setProperty('--gy', '-500px');
        };
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        this._tiltHandlers.push({ card, onMove, onLeave });
      });
    },

    initHeroWave() {
      const hero = this.$refs.hero;
      if (!hero) return;
      const wave = hero.querySelector('.hero-wave');
      if (!wave) return;

      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      wave.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const trail = []; // {x, y, age} — age in ms
      const MAX_TRAIL_AGE = 400; // trail fades over 400ms
      let animating = false;

      const resize = () => {
        canvas.width = hero.offsetWidth * devicePixelRatio;
        canvas.height = hero.offsetHeight * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
      };
      resize();
      this._heroResizeObs = new ResizeObserver(resize);
      this._heroResizeObs.observe(hero);

      let lastTime = 0;
      const draw = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Age all points
        for (let i = trail.length - 1; i >= 0; i--) {
          trail[i].age += dt;
          if (trail[i].age >= MAX_TRAIL_AGE) trail.splice(i, 1);
        }

        if (trail.length < 2) {
          if (trail.length === 0) { animating = false; return; }
          this._heroWaveRaf = requestAnimationFrame(draw);
          return;
        }

        // Draw continuous trail as connected segments
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.filter = 'blur(4px)';

        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];
          // Use the younger (newer) point's age for this segment
          const life = 1 - p0.age / MAX_TRAIL_AGE;
          if (life <= 0) continue;

          const alpha = life * life * 0.18;
          const width = life * 10;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = width;
          ctx.stroke();
        }
        ctx.filter = 'none';

        this._heroWaveRaf = requestAnimationFrame(draw);
      };

      this._heroMoveHandler = (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        trail.push({ x, y, age: 0 });

        if (!animating) {
          animating = true;
          lastTime = 0;
          this._heroWaveRaf = requestAnimationFrame(draw);
        }
      };
      this._heroLeaveHandler = () => {
        // Trail keeps fading naturally via age — no special handling needed
      };

      hero.addEventListener('mousemove', this._heroMoveHandler);
      hero.addEventListener('mouseleave', this._heroLeaveHandler);
    },
  },

  mounted() {
    this.currentLanguage = getCurrentLanguage();
    const auth = JSON.parse(localStorage.getItem('auth'));
    this.isLoggedIn = !!auth?.user?.id;
    this.fetchStatistics(auth?.user?.id);

    this._langHandler = (e) => {
      this.currentLanguage = e.detail.language;
      this.tmdbCache = {};
      this.fetchStatistics(auth?.user?.id);
    };
    window.addEventListener('languageChanged', this._langHandler);

    this.$nextTick(() => {
        this.initParallax();
        this.initTilt();
        this.initHeroWave();
      });
  },

  beforeUnmount() {
    window.removeEventListener('languageChanged', this._langHandler);
    if (this._observer) this._observer.disconnect();
    if (this._tiltHandlers) {
      this._tiltHandlers.forEach(({ card, onMove, onLeave }) => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    }
    if (this._heroWaveRaf) cancelAnimationFrame(this._heroWaveRaf);
    if (this._heroResizeObs) this._heroResizeObs.disconnect();
    const hero = this.$refs.hero;
    if (hero) {
      hero.removeEventListener('mousemove', this._heroMoveHandler);
      hero.removeEventListener('mouseleave', this._heroLeaveHandler);
    }
    [this.donutChart, this.siteChart, this.profitChart, this.userBarChart].forEach(c => c?.destroy());
  }
};
</script>

<style scoped>
/* Reset global div table layout for this page */
div {
  display: revert;
  width: revert;
  table-layout: revert;
}

/* ═══ PAGE ═══ */
/* Outer frame: clips the gradient and the canvas to the same rounded rect */
.stats-frame {
  max-width: 1340px;
  margin: 2rem auto 3rem;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Gradient behind the canvas — backdrop-filter will blur it */
.glass-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 55% 38% at 20% 25%, rgba(56, 200, 130, 0.5) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 60%, rgba(56, 230, 120, 0.55) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 55% 85%, rgba(70, 210, 150, 0.4) 0%, transparent 65%);
  filter: blur(24px);
}

.stats-canvas {
  width: auto;
  padding: 2rem 1.5rem 2.5rem;
  position: relative;
  z-index: 1;
  background: rgba(0, 40, 20, 0.12);
  backdrop-filter: blur(29px);
  -webkit-backdrop-filter: blur(29px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 10px 5px rgba(255, 255, 255, 0.08);
}

/* top edge highlight line */
.stats-canvas::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 20px, rgba(255,255,255,0.75) 50%, transparent calc(100% - 20px));
  pointer-events: none;
}

/* left edge highlight line */
.stats-canvas::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent 20px, rgba(255,255,255,0.55) 60px, transparent calc(100% - 20px));
  pointer-events: none;
}

.stats-page {
  padding: 0 0 3rem;
  overflow-x: hidden;
  max-width: 100%;
  position: relative;
}

/* ═══ SECTION DIVIDERS ═══ */
.section-divider {
  width: auto;
  margin: 2.5rem auto 1.25rem;
  padding: 0 1.25rem;
}

.sd-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.14);
  border-left: 4px solid var(--accent-color);
  background-color: rgba(6, 10, 20, 0.55);
  background-image:
    radial-gradient(circle 160px at var(--gx, -500px) var(--gy, -500px), rgba(255,255,255,0.11), transparent 70%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18);
  position: relative;
  overflow: hidden;
  width: fit-content;
  margin: 0 auto;
}

.sd-inner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent 16px, rgba(255,255,255,0.55), transparent calc(100% - 16px));
  pointer-events: none;
}

.sd-inner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(112,233,116,0.04) 0%, transparent 60%);
  pointer-events: none;
}

.section-user .sd-inner {
  border-left-color: rgb(70,210,150);
  border-color: rgba(70,210,150,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(70,210,150,0.2);
}

.section-user .sd-inner::after {
  background: linear-gradient(120deg, rgba(70,210,150,0.04) 0%, transparent 60%);
}

.sd-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: rgba(112,233,116,0.12);
  color: var(--accent-color);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.sd-icon-user {
  background: rgba(70,210,150,0.12);
  color: rgb(70,210,150);
}

@keyframes sdFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-4px); }
}

.sd-float {
  animation: sdFloat 3.6s ease-in-out infinite;
}

.sd-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.2px;
  animation: textSlideUp 0.55s cubic-bezier(0.16,0.84,0.24,1) both;
}

.sd-sub {
  font-size: 0.78rem;
  color: var(--subtitle-color);
  opacity: 0.7;
  margin-top: 1px;
  animation: textSlideUp 0.55s 0.08s cubic-bezier(0.16,0.84,0.24,1) both;
}

.sd-lock {
  margin-left: 12px;
  color: var(--subtitle-color);
  opacity: 0.45;
}

/* ═══ HERO ═══ */
.hero {
  background: var(--hero-gradient);
  padding: 20px 1.5rem;
  position: relative;
  overflow: hidden;
  margin-bottom: 0;
  box-shadow: var(--hero-shadow), 0 40px 50px -10px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

/* subtle gradient overlay inside hero */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 120% at 10% 50%, rgba(56,230,120,0.12) 0%, transparent 65%),
    radial-gradient(ellipse 50% 120% at 85% 40%, rgba(40,160,255,0.10) 0%, transparent 60%);
  pointer-events: none;
}

.hero-wave {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

/* shimmer sweep */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%, rgba(255,255,255,0.04) 30%,
    rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 70%, transparent 100%);
  animation: shimmer 3.2s cubic-bezier(.22,.1,.25,1) infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.hero-inner {
  max-width: 480px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
}

.hero-text {
  display: flex;
  flex-direction: column;
}

.hero-icon {
  width: 52px; height: 52px;
  border-radius: 16px;
  background: rgba(112,233,116,0.18);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent-color);
  flex-shrink: 0;
}

.hero-inner h1, .hero-text h1 {
  margin: 0 0 2px;
  font-size: 50px;
  font-weight: 800;
  color: var(--text-color);
  text-shadow: 0 4px 16px rgba(0,0,0,0.4);
  animation: textSlideUp 0.7s cubic-bezier(0.16,0.84,0.24,1) both;
}

.hero-inner p, .hero-text p {
  margin: 0;
  font-size: 18px;
  color: var(--subtitle-color);
  opacity: 0.85;
  animation: textSlideUp 0.7s 0.12s cubic-bezier(0.16,0.84,0.24,1) both;
}

/* ═══ HERO CHART LINE ═══ */
.hero-chart-line {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.hero-chart-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  animation: heroChartScroll 36s linear infinite;
  filter: drop-shadow(0 0 4px rgba(200,255,210,0.15));
}

@keyframes heroChartScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ═══ LAYOUT ═══ */
.kpi-row, .mid-row, .bot-row {
  max-width: 1300px;
  margin: 0 auto 1.5rem;
  padding: 0 1.25rem;
  display: grid;
  gap: 1.25rem;
}

.kpi-row { grid-template-columns: repeat(4, 1fr); }
.mid-row { grid-template-columns: 300px 1fr; }
.bot-row { grid-template-columns: 1fr 1fr; }

/* rows that immediately follow a section divider need no extra top margin */
.section-divider + .kpi-row,
.section-divider + .bot-row,
.section-divider + .mid-row {
  margin-top: 0;
}

/* ═══ PARALLAX REVEAL ═══ */
@keyframes textSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.reveal {
  opacity: 0;
  transform: translateY(38px) scale(0.98);
  transition: opacity 0.65s cubic-bezier(0.16,0.84,0.24,1),
              transform 0.65s cubic-bezier(0.16,0.84,0.24,1);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ═══ KPI CARDS ═══ */
.kpi-card {
  border-radius: 20px;
  padding: 22px 20px 0;
  position: relative;
  overflow: hidden;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  background-color: rgba(6, 10, 6, 0.62);
  background-image:
    radial-gradient(circle 220px at var(--gx, -500px) var(--gy, -500px), rgba(255,255,255,0.12), transparent 70%),
    linear-gradient(135deg, rgba(0,60,30,0.1) 0%, transparent 70%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.45s cubic-bezier(0.16,0.84,0.24,1), box-shadow 0.28s;
  will-change: transform;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 20px, rgba(255,255,255,0.75) 50%, transparent calc(100% - 20px));
  pointer-events: none;
  z-index: 1;
}

.kpi-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 1px; height: 100%;
  background: linear-gradient(180deg, transparent 20px, rgba(255,255,255,0.55) 60px, transparent calc(100% - 20px));
  pointer-events: none;
  z-index: 1;
}

.kpi-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5); }

.kpi-green  { border-color: rgba(112,233,116,0.35); background-color: rgba(8,22,10,0.7); }
.kpi-teal   { border-color: rgba(70,210,150,0.35);  background-color: rgba(6,22,16,0.7); }
.kpi-orange { border-color: rgba(60,190,120,0.35);  background-color: rgba(6,20,12,0.7); }
.kpi-blue   { border-color: rgba(80,220,140,0.35);  background-color: rgba(6,22,14,0.7); }

.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }

.kpi-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-color); opacity: 0.6; }

.kpi-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: var(--text-color); }

.kpi-value { font-size: 2rem; font-weight: 800; color: var(--text-color); line-height: 1; margin-bottom: 5px; }

.kpi-green  .kpi-value { color: rgb(180,255,185); filter: drop-shadow(0 0 10px rgba(112,233,116,0.7)); }
.kpi-teal   .kpi-value { color: rgb(160,245,190); filter: drop-shadow(0 0 10px rgba(70,210,150,0.7)); }
.kpi-orange .kpi-value { color: rgb(155,240,170); filter: drop-shadow(0 0 10px rgba(60,190,120,0.7)); }
.kpi-blue   .kpi-value { color: rgb(165,250,185); filter: drop-shadow(0 0 10px rgba(80,220,140,0.7)); }

.kpi-unit { font-size: 0.85rem; font-weight: 400; opacity: 0.55; }

.kpi-name { font-size: 0.78rem; color: var(--subtitle-color); opacity: 0.7; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.kpi-wave { margin: auto 0 0; height: 50px; margin-left: -20px; margin-right: -20px; }
.kpi-wave svg { width: 100%; height: 100%; display: block; }

/* ═══ PANELS ═══ */
.panel {
  background-color: rgba(6, 10, 6, 0.62);
  background-image:
    radial-gradient(circle 280px at var(--gx, -500px) var(--gy, -500px), rgba(255,255,255,0.09), transparent 60%),
    linear-gradient(135deg, rgba(0,60,30,0.1) 0%, transparent 70%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 22px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.45s cubic-bezier(0.16,0.84,0.24,1);
  will-change: transform;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  /* start after the rounded corner width to avoid the corner blob */
  background: linear-gradient(90deg, transparent 20px, rgba(255,255,255,0.75) 50%, transparent calc(100% - 20px));
  pointer-events: none;
  z-index: 1;
}

.panel::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 1px; height: 100%;
  /* fade in below the rounded corner */
  background: linear-gradient(180deg, transparent 20px, rgba(255,255,255,0.55) 60px, transparent calc(100% - 20px));
  pointer-events: none;
  z-index: 1;
}

.panel:hover {
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 16px 48px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5);
  transform: translateY(-2px);
}

.panel-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }

.panel-title { font-size: 0.95rem; font-weight: 700; color: var(--text-color); }

.panel-legend { display: flex; align-items: center; gap: 8px; }

.leg-dot, .dl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.leg-dot.green, .dl-dot.green { background: rgb(112,233,116); box-shadow: 0 0 8px rgba(112,233,116,0.9); }
.leg-dot.teal,  .dl-dot.teal  { background: rgb(70,210,150);  box-shadow: 0 0 8px rgba(70,210,150,0.9); }
.leg-dot.orange,.dl-dot.orange { background: rgb(60,190,120);  box-shadow: 0 0 8px rgba(60,190,120,0.9); }

.leg-lbl { font-size: 0.75rem; color: var(--subtitle-color); opacity: 0.7; }

/* Donut */
.donut-wrap { position: relative; width: 200px; height: 200px; margin: 0 auto 20px; }
.donut-wrap canvas { width: 100% !important; height: 100% !important; }

.donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }

.donut-val { font-size: 1.9rem; font-weight: 800; color: var(--accent-color); line-height: 1; filter: drop-shadow(0 0 10px rgba(112,233,116,0.8)); }
.donut-lbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: var(--subtitle-color); opacity: 0.55; margin-top: 3px; }

.donut-legend { display: flex; flex-direction: column; gap: 10px; }
.dl-row { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: var(--subtitle-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Charts */
.chart-wrap { height: 230px; position: relative; }
.chart-wrap canvas { width: 100% !important; height: 100% !important; }
.chart-bar-wrap { height: 160px; margin-top: 14px; }

/* PDF download button */
.panel-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.pdf-btn { padding: 0.45rem 0.9rem; background: linear-gradient(135deg, var(--gradient-start), var(--medium-bg-color)); color: var(--text-color); border-radius: 10px; font-weight: 700; border: 1px solid rgba(112,233,116,0.18); display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.15s; }
.pdf-btn[disabled] { opacity: 0.6; cursor: default; transform: none; }
.pdf-btn:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

/* Profit panel — inherits glass from .panel */

/* ═══ LOGIN PROMPT ═══ */
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 2rem 1.5rem;
  text-align: center;
  background: rgba(6, 10, 20, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-top: 1px solid rgba(255,255,255,0.18);
  box-shadow:
    0 8px 32px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.12);
  margin-top: 8px;
}

.lp-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(112,233,116,0.08); display: flex; align-items: center; justify-content: center; color: var(--accent-color); }

.login-prompt p { margin: 0; font-size: 0.9rem; color: var(--subtitle-color); opacity: 0.8; }

.lp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.6rem 1.4rem; background: linear-gradient(135deg, var(--gradient-start), var(--medium-bg-color)); color: var(--text-color); text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 0.85rem; border: 1px solid rgba(112,233,116,0.2); transition: all 0.25s; }

.lp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 16px rgba(112,233,116,0.1); border-color: rgba(112,233,116,0.4); }

/* ═══ USER KPIs ═══ */
.user-kpis { display: flex; gap: 10px; margin-bottom: 0; }

.uk-item {
  flex: 1;
  border-radius: 14px;
  padding: 13px;
  border: 1px solid rgba(255,255,255,0.06);
  min-width: 0;
}

.uk-green  { background: rgba(112,233,116,0.06); border-color: rgba(112,233,116,0.15); }
.uk-teal   { background: rgba(70,210,150,0.06);  border-color: rgba(70,210,150,0.15); }
.uk-orange { background: rgba(60,190,120,0.06);  border-color: rgba(60,190,120,0.15); }

.uk-val { font-size: 1.25rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
.uk-green  .uk-val { color: rgb(180,255,185); filter: drop-shadow(0 0 6px rgba(112,233,116,0.6)); }
.uk-teal   .uk-val { color: rgb(160,245,190); filter: drop-shadow(0 0 6px rgba(70,210,150,0.6)); }
.uk-orange .uk-val { color: rgb(155,240,170); filter: drop-shadow(0 0 6px rgba(60,190,120,0.6)); }

.uk-lbl { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--subtitle-color); opacity: 0.55; margin-bottom: 4px; }

.uk-name { font-size: 0.74rem; color: var(--text-color); opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.section-divider {
  width: auto;
}
h1 {
  padding: 0;
}
/* ═══ RESPONSIVE ═══ */
@media (max-width: 1100px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .mid-row { grid-template-columns: 1fr; }
  .bot-row { grid-template-columns: 1fr; }
  .donut-wrap { width: 180px; height: 180px; }
}

@media (max-width: 640px) {
  .kpi-row { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .kpi-row, .mid-row, .bot-row { padding: 0 0.75rem; margin-bottom: 0.75rem; }
  .section-divider { padding: 0 0.75rem; margin-top: 1.5rem; width:auto; }
  .user-kpis { flex-direction: column; }
  .hero { padding: 28px 1rem; min-height: 130px; }
  .hero-icon { width: 40px; height: 40px; }
}

@media (max-width: 400px) {
  .kpi-row { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  .hero::after { animation: none; }
  .hero-chart-svg { animation: none; }
}
</style>
