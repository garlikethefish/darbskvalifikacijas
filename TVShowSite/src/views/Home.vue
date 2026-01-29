<script>
import axios from 'axios';
import SeriesContainer from '@/components/SeriesContainer.vue';
import DailyQuote from '@/components/DailyQuote.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Caption from '@/components/Caption.vue';
import Aside from '@/components/Aside.vue';
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';

export default {
  name: 'Home',
  components: { SeriesContainer, DailyQuote, SectionHeader, Caption, Aside },
  data() {
    return {
      series: [],
      filteredSeries: [],
      loading: false,
      error: null,
      currentLanguage: 'en',
      selectedSort: 'random',
      selectedFilterType: '',
      filterOptions: {
        genres: [],
        years: [],
        selectedGenres: [],
        selectedYears: []
      }
    };
  },
  computed: {
    sortOptions() {
      return [
        { value: 'random', label: this.t('randomSort') },
        { value: 'title-asc', label: this.t('titleASC') },
        { value: 'title-desc', label: this.t('titleDESC') },
        { value: 'year-asc', label: this.t('yearOldest') },
        { value: 'year-desc', label: this.t('yearNewest') }
      ];
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    shuffleSeries(arr) {
      return arr.map(v => ({ v, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ v }) => v);
    },
    applySorting() {
      let filtered = this.applyFilters([...this.series]);

      switch(this.selectedSort) {
        case 'title-asc': filtered.sort((a,b)=>a.title.localeCompare(b.title)); break;
        case 'title-desc': filtered.sort((a,b)=>b.title.localeCompare(a.title)); break;
        case 'year-asc': filtered.sort((a,b)=>(a.release_year||0)-(b.release_year||0)); break;
        case 'year-desc': filtered.sort((a,b)=>(b.release_year||0)-(a.release_year||0)); break;
        case 'random': filtered = this.shuffleSeries(filtered); break;
      }
      this.filteredSeries = filtered;
    },
    applyFilters(seriesList) {
      if (this.selectedFilterType === 'genre' && this.filterOptions.selectedGenres.length) {
        seriesList = seriesList.filter(s =>
          s.genres.some(g => this.filterOptions.selectedGenres.includes(g))
        );
      }
      if (this.selectedFilterType === 'year' && this.filterOptions.selectedYears.length) {
        seriesList = seriesList.filter(s =>
          this.filterOptions.selectedYears.includes(s.release_year)
        );
      }
      return seriesList;
    },
    async fetchSeries() {
      this.loading = true;
      try {
        const res = await axios.get('/api/tmdb/top-series');
        this.series = res.data.map(show => ({
          id: show.id,
          title: show.title,
          description: show.description,
          release_year: show.release_year,
          series_picture: show.series_picture,
          genres: show.genres || [],
          number_of_seasons: show.number_of_seasons || 0,
          number_of_episodes: show.number_of_episodes || 0
        }));

        // populate filter options dynamically
        const genresSet = new Set();
        const yearsSet = new Set();
        this.series.forEach(s => {
          s.genres.forEach(g => genresSet.add(g));
          if (s.release_year) yearsSet.add(s.release_year);
        });
        this.filterOptions.genres = [...genresSet].sort();
        this.filterOptions.years = [...yearsSet].sort((a,b)=>b-a);

        this.applySorting();
      } catch (err) {
        console.error('Failed to fetch TMDB series:', err);
        this.error = 'Failed to load series.';
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    selectedSort() { this.applySorting(); },
    'filterOptions.selectedGenres'() { this.applySorting(); },
    'filterOptions.selectedYears'() { this.applySorting(); },
    selectedFilterType() {
      // reset selections when changing filter type
      this.filterOptions.selectedGenres = [];
      this.filterOptions.selectedYears = [];
      this.applySorting();
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.fetchSeries();
    // Listen for language changes
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.$forceUpdate();
    });
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  }
};
</script>

<template>
  <div id="app">
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <DailyQuote></DailyQuote>
        </div>
      </div>
    </header>
    <SectionHeader></SectionHeader>
    
    <!-- Sorting and Filtering Controls -->
    <div class="controls-container">
      <div class="controls-wrapper">
        <div class="sort-controls">
          <label for="sort-select">{{ t('sortBy') }}</label>
          <select id="sort-select" v-model="selectedSort" class="modern-select">
            <option v-for="option in sortOptions" :value="option.value" :key="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-controls">
          <label for="filter-type">{{ t('filterBy') }}</label>
          <select id="filter-type" v-model="selectedFilterType" class="modern-select">
            <option value="">{{ t('none') }}</option>
            <option value="genre">{{ t('genre') }}</option>
            <option value="year">{{ t('year') }}</option>
          </select>
        </div>
      </div>

      <!-- Genre Checkboxes -->
      <div class="filter-group" v-if="selectedFilterType === 'genre'">
        <div class="filter-options">
          <div v-for="genre in filterOptions.genres" :key="genre" class="filter-option">
            <input 
              type="checkbox" 
              :id="'genre-' + genre" 
              :value="genre" 
              v-model="filterOptions.selectedGenres"
              class="filter-checkbox"
            >
            <label :for="'genre-' + genre">{{ genre }}</label>
          </div>
        </div>
      </div>

      <!-- Year Checkboxes -->
      <div class="filter-group" v-if="selectedFilterType === 'year'">
        <div class="filter-options">
          <div v-for="year in filterOptions.years" :key="year" class="filter-option">
            <input 
              type="checkbox" 
              :id="'year-' + year" 
              :value="year" 
              v-model="filterOptions.selectedYears"
              class="filter-checkbox"
            >
            <label :for="'year-' + year">{{ year }}</label>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex-container">
      <div class="break"></div>
      <div v-if="loading" class="load">
        <h2>Loading series...</h2>
      </div>
      <div v-else-if="error">{{ error }}</div>
      <template v-else>
        <SeriesContainer 
          v-for="one_series in filteredSeries" 
          :key="one_series.id" 
          :series="one_series"
        />
        <div v-if="filteredSeries.length === 0" class="no-results">
          No series match your filters.
        </div>
      </template>
      <div class="break"></div>
    </div>
    <SectionHeader>{{ "" }}</SectionHeader> <!-- blank text -->
    <Aside></Aside>
  </div>
</template>
<style>
/* Hero Section */
.hero {
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
.break {
  margin-bottom: 40px;
}

.flex-container {
  justify-content: center;
  justify-items: center;
  align-items: center;
}

.controls-container {
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
.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sort-controls label,
.filter-controls label {
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

.no-results {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: var(--subtitle-color);
}
</style>