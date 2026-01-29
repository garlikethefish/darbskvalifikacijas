<template>
  <div class="series-detail">
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1 v-if="loading">Loading...</h1>
          <h1 v-else-if="series">{{ series.title }}</h1>
          <h1 v-else>{{ t('seriesDetails') }}</h1>
          <p class="subtitle">{{ yearRangeSubtitle }}</p>
        </div>
      </div>
    </header>

    <div v-if="loading" class="load">
      <div class="spinner"></div>
      <h2>Loading Series Details...</h2>
    </div>

    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else-if="series" class="content-container">
      <div class="series-card">
        <div class="poster-section">
          <button class="poster-button" @click="toggleTrailer" :disabled="!trailerKey" :title="trailerKey ? 'Play trailer' : 'Trailer not available'">
            <img :src="getSeriesPictureUrl(series.series_picture)" :alt="series.title" class="poster" />
            <div v-if="trailerKey" class="play-overlay">
              <span class="play-ring"></span>
              <span class="play-icon">▶</span>
              <span class="play-text">Trailer</span>
            </div>
          </button>
        </div>

        <!-- Video Modal -->
        <div v-if="showTrailer && trailerKey" class="video-modal" @click="closeTrailer">
          <div class="modal-content" @click.stop>
            <button class="close-btn" @click="closeTrailer" aria-label="Close video">&times;</button>
            <div class="trailer-frame">
              <iframe
                :src="`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`"
                title="Series Trailer"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h1>{{ series.title }}</h1>
          
          <div class="meta">
            <span v-if="series.release_year" class="meta-item">
              <strong>Release Year:</strong> {{ series.release_year }}
            </span>
            <span v-if="series.number_of_seasons" class="meta-item">
              <strong>Seasons:</strong> {{ series.number_of_seasons }}
            </span>
            <span v-if="series.number_of_episodes" class="meta-item">
              <strong>Episodes:</strong> {{ series.number_of_episodes }}
            </span>
          </div>

          <div v-if="series.genres && series.genres.length" class="genres">
            <strong>Genre:</strong>
            <span v-for="genre in series.genres" :key="genre" class="genre-tag">{{ genre }}</span>
          </div>

          <div class="description">
            <h2>Synopsis</h2>
            <p>{{ series.description || 'No description available.' }}</p>
          </div>

          <div class="actions">
            <router-link :to="`/create-review?seriesId=${series.id}`" class="btn btn-primary">
              Write Review
            </router-link>
            <router-link :to="`/reviews?seriesId=${series.id}&seriesTitle=${encodeURIComponent(series.title)}`" class="btn btn-secondary">
              See All Reviews
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="seriesReviews.length > 0" class="reviews-section">
        <h2>{{ t('communityReviews') }}</h2>
        <div class="reviews-list">
          <ReviewPost
            v-for="review in seriesReviews"
            :key="review.id"
            :review="review"
            @review-deleted="handleReviewDeleted"
          />
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>{{ t('seriesNotFound') }}</h2>
      <router-link to="/" class="btn btn-primary">{{ t('backHome') }}</router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ReviewPost from '@/components/ReviewPost.vue';
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';

export default {
  name: 'SeriesDetail',
  components: { ReviewPost },
  data() {
    return {
      series: null,
      seriesReviews: [],
      loading: true,
      error: null,
      currentLanguage: 'en',
      trailerKey: null,
      showTrailer: false
    };
  },
  computed: {
    yearRangeSubtitle() {
      if (!this.series) return '';
      const start = this.series.first_air_year;
      const end = this.series.last_air_year;
      if (start && end) return start === end ? `${start}` : `${start}-${end}`;
      if (start) return `${start}-present`;
      return '';
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    getSeriesPictureUrl(path) {
      if (!path) return new URL('../assets/series_images/basic_series.png', import.meta.url).href;
      return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
    },
    async fetchSeriesDetails() {
      const seriesId = this.$route.params.id;
      try {
        const res = await axios.get(`/api/tmdb/series-details/${seriesId}`);
        
        // Extract genre names from genre objects if necessary
        let genres = res.data.genres || [];
        if (genres.length > 0 && typeof genres[0] === 'object' && genres[0].name) {
          genres = genres.map(g => g.name);
        }
        
        // Extract just the series metadata (not episodes)
        this.series = {
          id: res.data.id,
          title: res.data.title || res.data.original_name || 'Unknown',
          description: res.data.description || res.data.overview || '',
          release_year: res.data.release_year || (res.data.first_air_date ? new Date(res.data.first_air_date).getFullYear() : null),
          first_air_year: res.data.first_air_date ? new Date(res.data.first_air_date).getFullYear() : null,
          last_air_year: res.data.last_air_date ? new Date(res.data.last_air_date).getFullYear() : null,
          series_picture: res.data.series_picture || res.data.poster_path,
          genres: genres,
          number_of_seasons: res.data.number_of_seasons || 0,
          number_of_episodes: res.data.number_of_episodes || 0
        };
        
        // Fetch reviews for this series
        this.fetchSeriesReviews(seriesId);
        this.fetchSeriesTrailer(seriesId);
      } catch (err) {
        console.error('Failed to load series details:', err);
        this.error = 'Failed to load series details.';
      } finally {
        this.loading = false;
      }
    },
    async fetchSeriesTrailer(seriesId) {
      try {
        const res = await axios.get(`/api/tmdb/series-videos/${seriesId}`);
        this.trailerKey = res.data?.key || null;
      } catch (err) {
        console.error('Failed to load trailer:', err);
        this.trailerKey = null;
      }
    },
    toggleTrailer() {
      if (!this.trailerKey) return;
      this.showTrailer = true;
    },
    closeTrailer() {
      this.showTrailer = false;
    },
    async fetchSeriesReviews(seriesId) {
      try {
        const res = await axios.get(`/api/reviews?seriesId=${seriesId}`);
        this.seriesReviews = res.data || [];
      } catch (err) {
        console.error('Failed to load reviews:', err);
        this.seriesReviews = [];
      }
    },
    handleReviewDeleted(deletedReviewId) {
      this.seriesReviews = this.seriesReviews.filter(review => review.id !== deletedReviewId);
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.fetchSeriesDetails();

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
.series-detail {
  padding: 0;
  margin: 0;
}

/* Hero Section */
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
}

.hero-inner .subtitle {
  margin: 0;
  color: var(--subtitle-color);
  font-size: clamp(0.95rem, 1.6vw, 1.1rem);
  opacity: 0.95;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem 2rem;
}

.series-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: linear-gradient(135deg, var(--dark-bg-color), rgba(112, 233, 116, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(112, 233, 116, 0.2);
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  animation: cardFloat 900ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.series-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(112, 233, 116, 0.08), transparent 55%);
  pointer-events: none;
}

.poster-section {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.poster-button {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transform-origin: center;
  transition: transform 250ms ease, box-shadow 250ms ease;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  width: min(420px, 90vw);
}

.poster-button:disabled {
  cursor: default;
}

.poster-button:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.poster-button:focus-visible {
  outline: 2px solid rgba(112, 233, 116, 0.6);
  outline-offset: 4px;
}

.poster {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: block;
}

.trailer-frame {
  width: 100%;
  display: flex;
  max-width: 420px;
  aspect-ratio: 2 / 3;
  background: #000;
}

.trailer-frame iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Video Modal */
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 300ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: auto;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  animation: slideUp 300ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content .trailer-frame {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  max-width: none;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(112, 233, 116, 0.3);
  transform: scale(1.1);
}

.close-btn:focus-visible {
  outline: 2px solid rgba(112, 233, 116, 0.6);
  outline-offset: 2px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.6));
  color: #fff;
  opacity: 0;
  transition: opacity 200ms ease;
}

.poster-button:hover .play-overlay {
  opacity: 1;
}

.play-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(112, 233, 116, 0.6);
  box-shadow: 0 0 18px rgba(112, 233, 116, 0.4);
  animation: pulseRing 1600ms ease-in-out infinite;
}

.play-icon {
  font-size: 1.6rem;
  transform: translateY(-60px);
}

.play-text {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: translateY(-48px);
  opacity: 0.85;
}

.info-section h1 {
  font-size: 2.5rem;
  margin: 0 0 1.5rem 0;
  color: var(--text-color);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(112, 233, 116, 0.2);
}

.meta-item {
  font-size: 0.95rem;
  color: var(--subtitle-color);
}

.meta-item strong {
  color: var(--accent-color);
}

.genres {
  margin-bottom: 1.5rem;
}

.genres strong {
  color: var(--accent-color);
  display: block;
  margin-bottom: 0.5rem;
}

.genre-tag {
  display: inline-block;
  background: rgba(112, 233, 116, 0.15);
  border: 1px solid rgba(112, 233, 116, 0.3);
  color: var(--text-color);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.genre-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

.description {
  margin-bottom: 2rem;
}

.description h2 {
  font-size: 1.3rem;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.description p {
  color: var(--subtitle-color);
  line-height: 1.6;
  font-size: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  box-shadow: 0 4px 15px rgba(112, 233, 116, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(112, 233, 116, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--accent-color);
  border: 2px solid rgba(112, 233, 116, 0.3);
}

.btn-secondary:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.2);
}

@keyframes cardFloat {
  0% { opacity: 0; transform: translateY(14px) scale(0.985); }
  60% { opacity: 1; transform: translateY(-2px) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes pulseRing {
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
}

.btn-secondary:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.2);
}

.reviews-section {
  margin-top: 3rem;
}

.reviews-section h2 {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
}

.reviews-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 12rem;
}

.load {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid rgba(112, 233, 116, 0.2);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.load h2 {
  color: var(--subtitle-color);
}

.error-message {
  text-align: center;
  padding: 40px;
  margin: 20px;
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.1), rgba(255, 100, 100, 0.05));
  border-radius: 12px;
  border-left: 4px solid #ff6464;
  color: #ff9090;
  font-size: 1.1em;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  font-size: 1.5rem;
  color: var(--subtitle-color);
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .series-card {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
  }

  .info-section h1 {
    font-size: 1.8rem;
  }

  .meta {
    flex-direction: column;
    gap: 0.75rem;
  }

  .reviews-list {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .poster {
    max-width: 320px;
  }

  .reviews-list {
    grid-template-columns: 1fr;
  }
}
</style>
