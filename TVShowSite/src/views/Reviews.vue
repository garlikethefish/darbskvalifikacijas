<template>
  <div class="reviews-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1>{{ t('communityReviews') }}</h1>
          <p class="subtitle">{{ t('discoverReviews') }}</p>
        </div>
      </div>
    </header>

    <div class="controls-container">
      <div class="controls-wrapper">
        <div class="sort-controls">
          <label for="sort-select">{{ t('sortBy') }}:</label>
          <select id="sort-select" v-model="selectedSort" class="modern-select">
            <option v-for="option in sortOptions" :value="option.value" :key="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="filter-controls">
          <label for="filter-select">{{ t('filterBy') }}:</label>
          <select id="filter-select" v-model="selectedFilterType" class="modern-select">
            <option value="">{{ t('none') }}</option>
            <option value="users">{{ t('user') }}</option>
            <option value="series">{{ t('series') }}</option>
            <option value="episodes">{{ t('episode') }}</option>
            <option value="ratings">{{ t('rating') }}</option>
          </select>
        </div>

        <div class="layout-controls">
          <label for="layout-select">{{ t('view') }}:</label>
          <div class="layout-buttons">
            <button 
              class="layout-btn" 
              :class="{ active: layoutMode === 'grid' }"
              @click="layoutMode = 'grid'"
              title="Grid layout">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="11" y="2" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="2" y="11" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="11" y="11" width="7" height="7" stroke="currentColor" stroke-width="1.5" rx="1"/>
              </svg>
            </button>
            <button 
              class="layout-btn" 
              :class="{ active: layoutMode === 'single' }"
              @click="layoutMode = 'single'"
              title="Single column layout">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="4" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="2" y="8" width="16" height="4" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="2" y="14" width="16" height="4" stroke="currentColor" stroke-width="1.5" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="selectedFilterType">
        <div class="filter-options">
          <div v-for="item in filterOptions[selectedFilterType]" :key="item" class="filter-option">
            <input 
              type="checkbox" 
              :value="item" 
              v-model="selectedFilters[selectedFilterType]" 
              :id="`${selectedFilterType}-${item}`"
              class="filter-checkbox"
            >
            <label :for="`${selectedFilterType}-${item}`">
              {{ selectedFilterType === 'ratings' ? `${item}★` : item }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="load">
      <div class="spinner"></div>
      <h2>{{ t('loading') }}...</h2>
    </div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="filteredAndSortedReviews.length === 0" class="no-reviews">
      <p>{{ t('noReviewsFound') }}</p>
    </div>
    <div v-else :class="['reviews-container', `layout-${layoutMode}`]">
      <ReviewPost
        v-for="review in filteredAndSortedReviews"
        :key="review.id"
        :review="review"
        @review-deleted="handleReviewDeleted"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ReviewPost from '@/components/ReviewPost.vue'
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  name: 'Reviews',
  components: { ReviewPost },
  data() {
    return {
      reviews: [],
      loading: false,
      error: null,
      layoutMode: 'grid',
      selectedSort: 'date-desc',
      selectedFilterType: '',
      currentLanguage: 'en',
      seriesIdFilter: null,
      seriesTitleFilter: null,
      selectedFilters: {
        users: [],
        series: [],
        episodes: [],
        ratings: [],
      },
      filterOptions: {
        users: [],
        series: [],
        episodes: [],
        ratings: [1, 2, 3, 4, 5],
      },
      filterLabels: {
        users: 'User',
        series: 'Series',
        episodes: 'Episode',
        ratings: 'Rating'
      }
    };
  },
  computed: {
    sortOptions() {
      return [
        { value: 'date-desc', label: this.t('dateNewest') },
        { value: 'date-asc', label: this.t('dateOldest') },
        { value: 'rating-desc', label: this.t('ratingHighest') },
        { value: 'rating-asc', label: this.t('ratingLowest') },
        { value: 'series', label: this.t('seriesAZ') },
        { value: 'episode', label: this.t('episodeAZ') }
      ];
    },
    filteredAndSortedReviews() {
      let filtered = [...this.reviews];

      // Apply series title filter if coming from series detail page
      if (this.seriesTitleFilter) {
        filtered = filtered.filter(review => 
          review.series_title === this.seriesTitleFilter
        );
      }

      // Apply filters
      if (this.selectedFilters.users.length > 0) {
        filtered = filtered.filter(review => 
          this.selectedFilters.users.includes(review.username)
        );
      }

      if (this.selectedFilters.series.length > 0) {
        filtered = filtered.filter(review => 
          this.selectedFilters.series.includes(review.series_title)
        );
      }

      if (this.selectedFilters.episodes.length > 0) {
        filtered = filtered.filter(review => 
          this.selectedFilters.episodes.includes(review.episode_title)
        );
      }

      if (this.selectedFilters.ratings.length > 0) {
        filtered = filtered.filter(review => 
          this.selectedFilters.ratings.includes(Number(review.rating))
        );
      }

      // Apply sorting
      switch (this.selectedSort) {
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'rating-asc':
          filtered.sort((a, b) => a.rating - b.rating);
          break;
        case 'rating-desc':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'series':
          filtered.sort((a, b) => a.series_title.localeCompare(b.series_title));
          break;
        case 'episode':
          filtered.sort((a, b) => a.episode_title.localeCompare(b.episode_title));
          break;
      }

      return filtered;
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    handleReviewDeleted(deletedReviewId) {
      this.reviews = this.reviews.filter(review => review.id !== deletedReviewId);
      this.updateFilterOptions();
    },
    updateFilterOptions() {
      const users = new Set();
      const series = new Set();
      const episodes = new Set();

      this.reviews.forEach(review => {
        if (review.username) users.add(review.username);
        if (review.series_title) series.add(review.series_title);
        if (review.episode_title) episodes.add(review.episode_title);
      });

      this.filterOptions.users = Array.from(users).sort();
      this.filterOptions.series = Array.from(series).sort();
      this.filterOptions.episodes = Array.from(episodes).sort();
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    
    // Check for series filter from query params
    const seriesId = this.$route.query.seriesId;
    const seriesTitle = this.$route.query.seriesTitle;
    if (seriesId && seriesTitle) {
      this.seriesIdFilter = seriesId;
      this.seriesTitleFilter = decodeURIComponent(seriesTitle);
    }

    this.loading = true;
    axios.get('/api/reviews')
      .then(res => {
        this.reviews = res.data;
        this.updateFilterOptions();
      })
      .catch(err => {
        console.error('Failed to load reviews:', err);
        this.error = 'Failed to load reviews.';
      })
      .finally(() => {
        this.loading = false;
      });

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
.reviews-page {
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

/* Page Content */
.reviews-page > .controls-container {
  max-width: 300px;
  margin: 30px auto;
  padding: 25px;
  background: linear-gradient(180deg, var(--dark-bg-color) 0%, rgba(112, 233, 116, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(112, 233, 116, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.controls-wrapper {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.sort-controls,
.filter-controls,
.layout-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sort-controls label,
.filter-controls label,
.layout-controls label {
  font-weight: 600;
  color: var(--accent-color);
  font-size: 0.95em;
}

.modern-select {
  padding: 10px 15px;
  border-radius: 8px;
  background: var(--dark-bg-color);
  color: var(--text-color);
  border: 2px solid rgba(112, 233, 116, 0.3);
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.3s ease;
}

.modern-select:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 8px rgba(112, 233, 116, 0.2);
}

.modern-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.3);
}

.layout-buttons {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(112, 233, 116, 0.2);
}

.layout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--subtitle-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.layout-btn:hover {
  background: rgba(112, 233, 116, 0.2);
  color: var(--accent-color);
}

.layout-btn.active {
  background: rgba(112, 233, 116, 0.3);
  color: var(--accent-color);
  border: 1px solid rgba(112, 233, 116, 0.5);
}

.filter-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  max-width: 600px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-checkbox {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.filter-option label {
  font-weight: 500;
  cursor: pointer;
  color: var(--text-color);
  transition: color 0.2s ease;
}

.filter-option:hover label {
  color: var(--accent-color);
}

.load {
  text-align: center;
  padding: 60px 20px;
  max-width: 1400px;
  margin: 0 auto;
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
  font-size: 1.2em;
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

.no-reviews {
  text-align: center;
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.no-reviews p {
  font-size: 1.3em;
  color: var(--subtitle-color);
}

/* Grid Layout - Multiple reviews per row */
.reviews-container.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 24px;
  grid-auto-rows: max-content;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 20px;
}

/* Single Column Layout - Bigger, more prominent reviews */
.reviews-container.layout-single {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px 20px;
}

/* Single layout reviews are bigger and more prominent */
.reviews-container.layout-single :deep(.review-container) {
  max-height: none;
  padding: 30px;
}

.reviews-container.layout-single :deep(.series-section) {
  max-width: 350px;
  min-width: 350px;
  padding: 25px;
}

.reviews-container.layout-single :deep(.square-img) {
  width: 280px;
  height: 280px;
}

.reviews-container.layout-single :deep(.right-container) {
  padding: 30px;
  max-height: none;
}

.reviews-container.layout-single :deep(.series-title) {
  font-size: 28px;
}

.reviews-container.layout-single :deep(.review-title) {
  font-size: 28px;
}

.reviews-container.layout-single :deep(.review-text) {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  font-size: 16px;
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .reviews-container.layout-grid {
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 2em;
  }

  .controls-wrapper {
    flex-direction: column;
    gap: 15px;
  }

  .sort-controls,
  .filter-controls,
  .layout-controls {
    width: 100%;
    justify-content: center;
  }

  .filter-options {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .reviews-container.layout-grid {
    grid-template-columns: 1fr;
  }

  .reviews-container.layout-single :deep(.review-container) {
    flex-direction: column;
  }

  .reviews-container.layout-single :deep(.series-section) {
    max-width: unset;
    min-width: unset;
    width: 100%;
  }

  .reviews-container.layout-single :deep(.square-img) {
    width: 240px;
    height: 240px;
  }
}
</style>