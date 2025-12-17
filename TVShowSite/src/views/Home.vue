<script>
import axios from 'axios';
import SeriesContainer from '@/components/SeriesContainer.vue';
import DailyQuote from '@/components/DailyQuote.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Caption from '@/components/Caption.vue';
import Aside from '@/components/Aside.vue';

export default {
  name: 'Home',
  components: { SeriesContainer, DailyQuote, SectionHeader, Caption, Aside },
  data() {
    return {
      series: [],
      filteredSeries: [],
      loading: false,
      error: null,
      sortOptions: [
        { value: 'random', label: 'Random' },
        { value: 'title-asc', label: 'Title (A-Z)' },
        { value: 'title-desc', label: 'Title (Z-A)' },
        { value: 'year-asc', label: 'Oldest First' },
        { value: 'year-desc', label: 'Newest First' }
      ],
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
  methods: {
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
    this.fetchSeries();
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