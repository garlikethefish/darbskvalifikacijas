<template>
  <div>
    <h1 id="first-title">Reviews</h1>
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
          <label for="filter-select">Filter by:</label>
          <select id="filter-select" v-model="selectedFilterType">
            <option value="">None</option>
            <option value="users">User</option>
            <option value="series">Series</option>
            <option value="episodes">Episode</option>
            <option value="ratings">Rating</option>
          </select>
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
            >
            <label :for="`${selectedFilterType}-${item}`">
              {{ selectedFilterType === 'ratings' ? `${item}★` : item }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="load">
      <h2>Loading reviews...</h2>
    </div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
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

export default {
  name: 'Reviews',
  components: { ReviewPost },
  data() {
    return {
      reviews: [],
      loading: false,
      error: null,
      selectedSort: 'date-desc',
      selectedFilterType: '',
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
      },
      sortOptions: [
        { value: 'date-desc', label: 'Newest First' },
        { value: 'date-asc', label: 'Oldest First' },
        { value: 'rating-desc', label: 'Highest Rating' },
        { value: 'rating-asc', label: 'Lowest Rating' },
        { value: 'series', label: 'Series Title (A-Z)' },
        { value: 'episode', label: 'Episode Title (A-Z)' }
      ]
    };
  },
  computed: {
    filteredAndSortedReviews() {
      let filtered = [...this.reviews];

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
  mounted() {
    this.loading = true;
    axios.get('/api/reviews')
      .then(res => {
        this.reviews = res.data;

        // Extract unique values for filters
        const users = new Set();
        const series = new Set();
        const episodes = new Set();

        res.data.forEach(review => {
          if (review.username) users.add(review.username);
          if (review.series_title) series.add(review.series_title);
          if (review.episode_title) episodes.add(review.episode_title);
        });

        this.filterOptions.users = Array.from(users).sort();
        this.filterOptions.series = Array.from(series).sort();
        this.filterOptions.episodes = Array.from(episodes).sort();
      })
      .catch(err => {
        console.error('Failed to load reviews:', err);
        this.error = 'Failed to load reviews.';
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    handleReviewDeleted(deletedReviewId) {
      this.reviews = this.reviews.filter(review => review.id !== deletedReviewId);
      
      // Update filter options after deletion
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
  }
};
</script>

<style>
.load {
  text-align: center;
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