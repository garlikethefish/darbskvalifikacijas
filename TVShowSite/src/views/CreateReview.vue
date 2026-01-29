<template>
  <div id="app">
    <div class="create-review">
      <h1>{{ t('createNewReview') }}</h1>

      <!-- Search Bar -->
      <div class="form-section search-section">
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="t('searchTVSeries')"
          @input="searchSeries"
        />
      </div>

      <!-- Series Grid -->
      <div class="form-section series-section">
        <h2>{{ t('tvSeries') }}</h2>
        <div class="series-grid">
          <div
            class="series-item"
            v-for="series in filteredSeries"
            :key="series.id"
            @click="selectSeries(series)"
            :class="{ selected: selectedSeries?.id === series.id }"
          >
            <img :src="getSeriesPictureUrl(series.series_picture)" />
            <p>{{ series.title }}</p>
          </div>
        </div>
      </div>

      <!-- Episodes Grid -->
      <div class="form-section episode-section" v-if="selectedSeries">
        <h2>{{ t('episodes') }}</h2>
        <div v-if="loadingEpisodes" class="loading-text">{{ t('loadingEpisodes') }}</div>
        <div v-else class="episodes-grid">
          <div v-for="season in episodesBySeason" :key="season.season_number" class="season-block">
            <h3>Season {{ season.season_number }}</h3>
            <div class="episode-grid">
              <div class="modal" v-if="isReviewModalOpen" @click.self="closeReviewModal">
                <div class="modal-content">
                  <span class="close" @click="closeReviewModal">&times;</span>

                  <h2>{{ t('createReview') }}</h2>
                  <p class="modal-episode">
                    {{ selectedEpisode.name }}
                  </p>

                  <label>{{ t('reviewTitle') }}</label>
                  <input v-model="review.title" type="text" />

                  <label>{{ t('description') }}</label>
                  <textarea v-model="review.description"></textarea>

                  <label>{{ t('rating') }}</label>
                    <div class="rating-circles">
                      <div
                        v-for="n in 5"
                        :key="n"
                        class="circle"
                        :class="{ selected: review.rating === n, hover: hoverRating === n }"
                        @click="review.rating = n"
                        @mouseenter="hoverRating = n"
                        @mouseleave="hoverRating = null"
                      >
                        {{ n }}
                      </div>
                    </div>


                  <button @click="submitReview">{{ t('postReview') }}</button>
                </div>
              </div>
              <div
                class="episode-item"
                v-for="episode in season.episodes"
                :key="episode.id"
                @click="selectEpisode(episode)"
              >
                <div class="episode-image-wrapper">
                  <img :src="getEpisodePictureUrl(episode.still_path)" />

                  <div class="episode-badge">
                    E{{ String(episode.episode_number).padStart(2, "0") }}
                  </div>
                </div>

                <div class="episode-meta">
                  <p class="episode-title">{{ episode.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  name: "CreateReview",
  data() {
    return {
      seriesList: [],
      filteredSeries: [],
      selectedSeries: null,
      episodesBySeason: [],
      selectedEpisode: null,
      review: { title: "", description: "", rating: 5 },
      searchQuery: "",
      loadingEpisodes: false,
      hoverRating: 0,
      isReviewModalOpen: false,
      currentLanguage: 'en'
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    async fetchTopSeries() {
      try {
        const res = await fetch("/api/tmdb/top-series");
        const data = await res.json();
        this.seriesList = data.sort((a, b) => a.title.localeCompare(b.title));
        this.filteredSeries = [...this.seriesList];
      } catch (err) {
        console.error("Failed to fetch top series:", err);
      }
    },

    async searchSeries() {
      if (!this.searchQuery.trim()) {
        this.filteredSeries = [...this.seriesList];
        return;
      }

      try {
        const res = await fetch(
          `/api/tmdb/search-series?query=${encodeURIComponent(this.searchQuery)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        this.filteredSeries = data.sort((a, b) => a.title.localeCompare(b.title));
      } catch (err) {
        console.error("Search failed:", err);
        this.filteredSeries = [];
      }
    },

    async selectSeries(series) {
      this.selectedSeries = series;
      this.selectedEpisode = null;
      this.episodesBySeason = [];
      this.loadingEpisodes = true;

      try {
        // Single request to fetch all seasons + episodes
        const res = await fetch(`/api/tmdb/series-details/${series.id}`);
        const data = await res.json();
        this.episodesBySeason = data.seasons || [];
      } catch (err) {
        console.error("Failed to fetch episodes:", err);
        this.episodesBySeason = [];
      } finally {
        this.loadingEpisodes = false;
      }
    },

    getSeriesPictureUrl(path) {
      if (!path) return new URL("../assets/series_images/basic_series.png", import.meta.url).href;
      return path.startsWith("http") ? path : `https://image.tmdb.org/t/p/w500${path}`;
    },

    getEpisodePictureUrl(path) {
      if (!path) return new URL("../assets/series_images/basic_series.png", import.meta.url).href;
      return path.startsWith("http") ? path : `https://image.tmdb.org/t/p/w300${path}`;
    },
    selectEpisode(episode) {
      this.selectedEpisode = episode;
      this.isReviewModalOpen = true;
      this.review.rating = null; // reset rating when selecting new episode
      this.review.title = "";
      this.review.description = "";
    },

    closeReviewModal() {
      this.isReviewModalOpen = false;
      this.review.rating = null; // reset rating when closing modal
      this.hoverRating = null;
      this.review.title = "";
      this.review.description = "";
    },

    async submitReview() {
      const auth = JSON.parse(localStorage.getItem("auth"));
      if (!auth?.user || !this.selectedEpisode || !this.selectedSeries) return;

      const payload = {
        tmdb_series_id: this.selectedSeries.id,
        season_number: this.selectedEpisode.season_number,
        episode_number: this.selectedEpisode.episode_number,
        rating: this.review.rating,
        review_title: this.review.title,
        review_text: this.review.description
      };

      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": auth.user.id.toString()
          },
          body: JSON.stringify(payload)
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          throw new Error("Invalid server response");
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to post review");
        }

        alert("Review posted successfully!");
        this.$router.push("/profile");
      } catch (err) {
        console.error("Failed to submit review:", err);
        alert(err.message);
      }
    }

  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.fetchTopSeries();

    // Pre-select series if passed via query parameter
    this.$nextTick(() => {
      const seriesId = this.$route.query.seriesId;
      if (seriesId) {
        const series = this.seriesList.find(s => s.id == seriesId);
        if (series) {
          this.selectSeries(series);
        }
      }
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
.create-review {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
  color: var(--text-color);
}

.form-section {
  background-color: var(--dark-bg-color);
  margin-bottom: 20px;
  padding: 15px 20px;
  border-radius: 8px;
}

.search-section input {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #444;
  background-color: var(--background-color);
  color: var(--text-color);
}
.episode-title {
  
  font-size: 0.95rem;
  line-height: 1.25;
  text-align: center;

  white-space: normal; 
  word-break: break-word;   
  overflow-wrap: anywhere; 
}
.episode-meta {
  min-height: 54px;
}

.series-grid, .episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.series-item, .episode-item {
  cursor: pointer;
  text-align: center;
  border-radius: 8px;
  border: 2px solid transparent;
  padding: 5px;
}

.series-item.selected, .episode-item.selected {
  border-color: #0077ff;
  background-color: rgba(0, 119, 255, 0.1);
}
.episode-image-wrapper {
  position: relative;
}

.episode-badge {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-weight: 800;
  font-size: 1rem;
  padding: 4px 10px;
  border-radius: 999px;
  pointer-events: none;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: var(--background-color);
  padding: 30px 25px;
  width: 100%;
  max-width: 520px;
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px; /* evenly space content */
  box-shadow: 0 8px 20px rgba(0,0,0,0.6);
}

.modal-content h2 {
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
}

.modal-episode {
  opacity: 0.9;
  text-align: center;
  font-weight: 500;
}

.modal-content label {
  font-weight: 600;
  margin-bottom: 4px;
}

.modal-content input,
.modal-content textarea {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #555;
  background-color: var(--dark-bg-color);
  color: var(--text-color);
  font-size: 0.95rem;
  resize: vertical;
}

.modal-content textarea {
  min-height: 80px;
}

.modal-content button {
  background-color: #2fa071;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  padding: 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.modal-content button:hover {
  background-color: #38bb89;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(56, 187, 137, 0.5);
}

.close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 26px;
  font-weight: bold;
  cursor: pointer;
  color: #fff;
  transition: transform 0.2s ease;
}

.close:hover {
  color: #ff5c5c;
}
.rating-circles {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 15px;
}

.circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #555; /* grey default */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  color: black; /* text black */
  transition: all 0.2s ease;
}

/* Hover effect */
.circle:hover {
  transform: scale(1.2);
}

/* Selected circle colors */
.circle.selected:nth-child(1) { background-color: #ff4c4c; } /* 1 - red */
.circle.selected:nth-child(2) { background-color: #ff944c; } /* 2 - orange */
.circle.selected:nth-child(3) { background-color: #ffd54c; } /* 3 - yellow */
.circle.selected:nth-child(4) { background-color: #a6ff4c; } /* 4 - light green */
.circle.selected:nth-child(5) { background-color: #4cff6a; } /* 5 - green */

/* Glow effect matching circle color */
.circle.selected:nth-child(1) { box-shadow: 0 0 10px #ff4c4c, 0 0 20px #ff4c4c; }
.circle.selected:nth-child(2) { box-shadow: 0 0 10px #ff944c, 0 0 20px #ff944c; }
.circle.selected:nth-child(3) { box-shadow: 0 0 10px #ffd54c, 0 0 20px #ffd54c; }
.circle.selected:nth-child(4) { box-shadow: 0 0 10px #a6ff4c, 0 0 20px #a6ff4c; }
.circle.selected:nth-child(5) { box-shadow: 0 0 10px #4cff6a, 0 0 20px #4cff6a; }



.series-item img, .episode-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}
.series-section{
  max-width: none;
}
.season-block h3 {
  margin-top: 15px;
  font-weight: bold;
  font-size: 1rem;
}

.review-form input,
.review-form textarea {
  width: 100%;
  margin: 8px 0 15px;
  border-radius: 4px;
  border: 1px solid #555;
  padding: 5px;
}

.review-form button {
  background: #1e8a54;
  color: white;
  padding: 12px 20px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.review-form button:hover {
  background: #2cac56;
}

.loading-text {
  font-style: italic;
  text-align: center;
  margin: 15px 0;
}

@media (max-width: 700px) {
  .series-grid, .episode-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
