<script>
import axios from 'axios';
import Caption from '@/components/Caption.vue';
import DailyQuote from '@/components/DailyQuote.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import SeriesContainer from '@/components/SeriesContainer.vue';
import Aside from '@/components/Aside.vue';
export default {
  name: 'Home',
  components: {
    DailyQuote,
    Caption,
    SectionHeader,
    SeriesContainer,
    Aside
  },
  data() {
    return {
      series: [],
      filteredSeries: [],
      error: null,
      loading: false,
      sortOptions: [
        { value: 'random', label: 'Random' },
        { value: 'title-asc', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'year-asc', label: 'Oldest First' },
        { value: 'year-desc', label: 'Newest First' }
      ],
      selectedSort: 'random',
      selectedFilterType: '', // 'genre' or 'year'
      filterOptions: {
        genres: [],
        years: [],
        selectedGenres: [],
        selectedYears: []
      }
    };
  },
  computed: {
    availableYears() {
      const years = new Set();
      this.series.forEach(series => {
        if (series.release_year) {
          years.add(series.release_year);
        }
      });
      return Array.from(years).sort((a, b) => b - a);
    }
  },
  methods: {
    shuffleSeries(series) {
      return series
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    },
    applyFiltersAndSorting() {
      // Apply filters
      let filtered = [...this.series];
      
      // Filter by genre if any selected
      if (this.filterOptions.selectedGenres.length > 0) {
        filtered = filtered.filter(series => 
          this.filterOptions.selectedGenres.some(genre => 
            series.genre && series.genre.toLowerCase().includes(genre.toLowerCase())
          )
        );
      }
      
      // Filter by year if any selected
      if (this.filterOptions.selectedYears.length > 0) {
        filtered = filtered.filter(series => 
          this.filterOptions.selectedYears.includes(series.release_year)
        );
      }
      
      // Apply sorting
      switch(this.selectedSort) {
        case 'title-asc':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'title-desc':
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'year-asc':
          filtered.sort((a, b) => (a.release_year || 0) - (b.release_year || 0));
          break;
        case 'year-desc':
          filtered.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
          break;
        case 'random':
        default:
          filtered = this.shuffleSeries(filtered);
          break;
      }
      
      this.filteredSeries = filtered;
    },
    extractGenres(series) {
      const genres = new Set();
      series.forEach(show => {
        if (show.genre) {
          show.genre.split(',').forEach(g => {
            const trimmed = g.trim();
            if (trimmed) genres.add(trimmed);
          });
        }
      });
      return Array.from(genres).sort();
    }
  },
  watch: {
    selectedSort() {
      this.applyFiltersAndSorting();
    },
    'filterOptions.selectedGenres'() {
      this.applyFiltersAndSorting();
    },
    'filterOptions.selectedYears'() {
      this.applyFiltersAndSorting();
    }
  },
  mounted() {
    this.loading = true;

    axios.get('/api/series')
      .then(res => {
        this.series = res.data;
        this.filterOptions.genres = this.extractGenres(res.data);
        this.filterOptions.years = this.availableYears;
        this.filteredSeries = this.shuffleSeries(res.data);
      })
      .catch(err => {
        console.error('Failed to load series:', err);
        this.error = 'Failed to load series.';
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>
<template>
  <div id="app">
    <DailyQuote></DailyQuote>
    <SectionHeader></SectionHeader>
    
    <!-- Sorting and Filtering Controls -->
    <div class="controls-container">
      <div class="sort-controls">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" v-model="selectedSort">
          <option v-for="option in sortOptions" :value="option.value" :key="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label for="filter-type">Filter Type:</label>
          <select id="filter-type" v-model="selectedFilterType">
            <option value="">None</option>
            <option value="genre">Genre</option>
            <option value="year">Year</option>
          </select>
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
              >
              <label :for="'year-' + year">{{ year }}</label>
            </div>
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
  margin: 0 auto 20px;
  padding: 15px;
  background: var(--dark-bg-color);
  border-radius: 8px;
  text-align: center; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sort-controls {
  display: flex;
  margin-bottom: 15px;
  justify-content: center;
}

.sort-controls label {
  margin-right: 10px;
  font-weight: bold;
  
}

.sort-controls select {
  padding: 5px 10px;
  border-radius: 4px;
  background: var(--light-bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}



.filter-group {
  display: flex;
  justify-content: center;
}
.filter-controls select{
  padding: 5px 10px;
  border-radius: 4px;
  background: var(--light-bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.filter-group label {
  margin-right: 10px;
  font-weight: bold;
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  max-width: 300px;
  gap: 10px;
  padding: 10px;
  margin-top: 10px;
}
.filter-option {
  display: flex;
  align-items: center;
  gap: 5px;
}
.filter-option label {
  font-weight: normal;
}

.filter-option input[type="checkbox"] {
  margin: 0;
}

.no-results {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: var(--subtitle-color);
}
</style>