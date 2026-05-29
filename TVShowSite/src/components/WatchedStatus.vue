<template>
  <div class="watched-status-container">
    <div class="watched-section">
      <h3><SvgIcon name="monitor" :size="20" /> {{ t('watchedStatus') }}</h3>
      
      <!-- Noskatītā statusa pārslēgs -->
      <div class="watch-show-container">
        <label class="watch-label">
          <input 
            type="checkbox" 
            v-model="showWatched"
            @change="updateShowWatched"
            class="watch-checkbox"
          >
          <span class="watch-text">{{ t('markShowWatched') }}</span>
        </label>
      </div>

      <!-- Noskatītās sērijas -->
      <div v-if="seasons && seasons.length > 0" class="episodes-section">
        <div class="season-selector">
          <label>{{ t('season') }}:</label>
          <select v-model="selectedSeason" @change="onSeasonChange" class="season-select">
            <option value="">{{ t('allSeasons') }}</option>
            <option v-for="season in seasons" 
              :key="season.season_number" 
              :value="season.season_number"
            >
              {{ t('season') }} {{ season.season_number }}
            </option>
          </select>
        </div>

        <div class="episodes-list">
          <div 
            v-for="episode in filteredEpisodes" 
            :key="`${episode.season_number}-${episode.episode_number}`"
            class="episode-item"
          >
            <img
              v-if="episode.still_path"
              :src="`https://image.tmdb.org/t/p/w300${episode.still_path}`"
              :alt="episode.name"
              class="episode-still"
            />
            <label class="episode-label">
              <input 
                type="checkbox"
                :checked="isEpisodeWatched(episode.season_number, episode.episode_number)"
                @change="toggleEpisodeWatched(episode.season_number, episode.episode_number)"
                class="episode-checkbox"
              >
              <span class="episode-info">
                S{{ padNumber(episode.season_number) }}E{{ padNumber(episode.episode_number) }}: {{ episode.name }}
              </span>
            </label>
          </div>
        </div>

        <!-- Statistika -->
        <div class="watched-stats">
          <p>{{ watchedEpisodeCount }} / {{ totalEpisodeCount }} {{ t('episodesWatched') }}</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: watchedPercentage + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  components: { SvgIcon },
  props: {
    seriesId: {
      type: Number,
      required: true
    },
    seriesData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showWatched: false,
      selectedSeason: '',
      watchedEpisodes: new Set(),
      seasons: [],
      currentLanguage: 'en'
    };
  },
  computed: {
    filteredEpisodes() {
      if (!this.seriesData.seasons) return [];
      if (!this.selectedSeason) {
        // Atgriež visas sērijas no visām sezonām
        const allEpisodes = [];
        this.seriesData.seasons.forEach(season => {
          if (season.episodes) {
            allEpisodes.push(...season.episodes);
          }
        });
        return allEpisodes;
      } else {
        // Atgriež sērijas no izvēlētās sezonas
        const season = this.seriesData.seasons.find(s => s.season_number === parseInt(this.selectedSeason));
        return season ? season.episodes || [] : [];
      }
    },
    watchedEpisodeCount() {
      return this.watchedEpisodes.size;
    },
    totalEpisodeCount() {
      return this.filteredEpisodes.length || this.getTotalEpisodes();
    },
    watchedPercentage() {
      if (this.totalEpisodeCount === 0) return 0;
      return Math.round((this.watchedEpisodeCount / this.totalEpisodeCount) * 100);
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    padNumber(num) {
      return String(num).padStart(2, '0');
    },
    getTotalEpisodes() {
      if (!this.seriesData.seasons) return 0;
      return this.seriesData.seasons.reduce((total, season) => {
        return total + (season.episodes?.length || 0);
      }, 0);
    },
    async updateShowWatched() {
      if (!localStorage.getItem('auth')) {
        await this.$alert(this.t('pleaseLoginMarkShowsWatched'));
        this.showWatched = false;
        return;
      }

      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        await fetch('/api/watched-shows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({
            tmdb_series_id: this.seriesId,
            watched_status: this.showWatched ? 'fully' : 'partially'
          })
        });
        
        this.$emit('show-watched-updated', this.showWatched);
      } catch (error) {
        console.error('Error updating show watched status:', error);
        this.$alert(this.t('errorUpdatingWatchedStatus'));
        this.showWatched = !this.showWatched;
      }
    },
    async toggleEpisodeWatched(seasonNumber, episodeNumber) {
      if (!localStorage.getItem('auth')) {
        this.$alert(this.t('pleaseLoginMarkEpisodesWatched'));
        return;
      }

      const auth = JSON.parse(localStorage.getItem('auth'));
      const episodeKey = `${seasonNumber}-${episodeNumber}`;
      const isCurrentlyWatched = this.watchedEpisodes.has(episodeKey);

      try {
        if (!isCurrentlyWatched) {
          // Atzīmēt kā noskatītu
          await fetch('/api/watched-episodes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': auth.user.id.toString()
            },
            body: JSON.stringify({
              tmdb_series_id: this.seriesId,
              season_number: seasonNumber,
              episode_number: episodeNumber
            })
          });
          this.watchedEpisodes.add(episodeKey);
        } else {
          // Reālā lietotnē būtu DELETE galapunkts
          this.watchedEpisodes.delete(episodeKey);
        }
        
        this.$emit('episode-watched-updated', { seasonNumber, episodeNumber, watched: !isCurrentlyWatched });
      } catch (error) {
        console.error('Error updating episode watched status:', error);
        this.$alert(this.t('errorUpdatingEpisodeStatus'));
      }
    },
    isEpisodeWatched(seasonNumber, episodeNumber) {
      return this.watchedEpisodes.has(`${seasonNumber}-${episodeNumber}`);
    },
    async loadWatchedStatus() {
      if (!localStorage.getItem('auth')) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        // Ielādē noskatītos seriālus
        const showRes = await fetch(`/api/watched-shows/${auth.user.id}`);
        const shows = await showRes.json();
        const watchedShow = shows.find(s => s.tmdb_series_id === this.seriesId);
        this.showWatched = watchedShow ? watchedShow.watched_status === 'fully' : false;

        // Ielādē noskatītās sērijas
        const episodeRes = await fetch(`/api/watched-episodes/${auth.user.id}/${this.seriesId}`);
        const episodes = await episodeRes.json();
        episodes.forEach(ep => {
          this.watchedEpisodes.add(`${ep.season_number}-${ep.episode_number}`);
        });
      } catch (error) {
        console.error('Error loading watched status:', error);
      }
    }
  },
  watch: {
    seriesData: {
      handler(newData) {
        if (newData.seasons) {
          this.seasons = newData.seasons;
          if (!this.selectedSeason) {
            const first = newData.seasons.find(s => s.season_number >= 1);
            if (first) this.selectedSeason = first.season_number;
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this._languageChangedHandler = (e) => {
      this.currentLanguage = e.detail.language;
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
    if (this.seriesData.seasons) {
      this.seasons = this.seriesData.seasons;
      const first = this.seriesData.seasons.find(s => s.season_number >= 1);
      if (first) this.selectedSeason = first.season_number;
    }
    this.loadWatchedStatus();
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
  }
};
</script>

<style scoped>
.watched-status-container {
  margin: 2rem 0;
}

.watched-section {
  background: var(--glass-bg-strong);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.watched-section h3 {
  color: var(--accent-color);
  margin-top: 0;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.watch-show-container {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--surface-bg);
  border-radius: 8px;
}

.watch-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.watch-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #9370db;
}

.watch-text {
  color: var(--text-color);
  font-weight: 500;
}

.episodes-section {
  margin-top: 1.5rem;
}

.season-selector {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.season-selector label {
  color: var(--text-color);
  font-weight: 500;
}

.season-select {
  padding: 0.5rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
}

.season-select:hover,
.season-select:focus {
  border-color: #9370db;
  outline: none;
}

.episodes-list {
  max-height: 400px;
  overflow-y: auto;
  background: var(--surface-bg);
  border-radius: 8px;
  padding: 1rem;
}

.episode-item {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.episode-item:last-child {
  border-bottom: none;
}

.episode-still {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--surface-bg-soft);
}

.episode-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  flex: 1;
}

.episode-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #9370db;
}

.episode-info {
  color: var(--subtitle-color);
  font-size: 0.95rem;
}

.episode-item:hover .episode-info {
  color: var(--accent-color);
}

.watched-stats {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--surface-bg);
  border-radius: 8px;
}

.watched-stats p {
  color: var(--text-color);
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: var(--surface-bg-soft);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid var(--surface-border);
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), rgba(255,255,255,0.9));
  width: 0%;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(28,166,102,0.08);
}

/* Pielāgota ritjosla */
.episodes-list::-webkit-scrollbar {
  width: 6px;
}

.episodes-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.episodes-list::-webkit-scrollbar-thumb {
  background: rgba(147, 112, 219, 0.3);
  border-radius: 3px;
}

.episodes-list::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 112, 219, 0.5);
}

@media (max-width: 768px) {
  .episodes-list {
    max-height: 300px;
  }

  .season-selector {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
