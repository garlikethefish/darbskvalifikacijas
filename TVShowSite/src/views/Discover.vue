<template>
  <div class="discover-page">
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1>{{ t('discoverTitle') }}</h1>
          <p class="subtitle">{{ t('discoverSubtitle') }}</p>
        </div>
      </div>
    </header>

    <section v-if="loading" class="loading">{{ t('scanning') }}</section>

    <section v-else>
      <div v-if="!isLoggedIn" class="login-prompt-section">
        <div class="lock-icon">{{ t('lockIcon') }}</div>
        <h2>{{ t('unlockDiscovery') }}</h2>
        <p>{{ t('signInRecommendations') }}</p>
        <router-link to="/login" class="login-btn">{{ t('signIn') }}</router-link>
      </div>

      <div v-else-if="recommendations.length === 0" class="empty">
        <h2>{{ t('noRecommendations') }}</h2>
        <p>{{ t('reviewShows') }}</p>
      </div>

      <div v-else>
        <div class="controls-container">
          <div class="controls-wrapper">
            <div class="filter-controls">
              <label for="genre-select">{{ t('genre') }}:</label>
              <select id="genre-select" v-model="selectedGenre" class="modern-select">
                <option value="">{{ t('any') }}</option>
                <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>

            <div class="filter-controls">
              <label for="rating-select">{{ t('minMatch') }}:</label>
              <select id="rating-select" v-model.number="selectedRating" class="modern-select">
                <option :value="0">{{ t('any') }}</option>
                <option v-for="r in [1,2,3,4,5]" :key="r" :value="r">{{ r }}+</option>
              </select>
            </div>

            <button class="clear-btn" @click="clearFilters">{{ t('clear') }}</button>
          </div>
        </div>

        <div class="grid" ref="grid">
          <div
            v-for="(show, idx) in visibleRecommendations"
            :key="show.id"
            class="show-card"
            :style="{'--i': idx}"
          >
            <img :src="show.poster" alt="Poster" />
            <div class="match-badge" :aria-label="`Match ${show.matchStars ?? Math.round((show.matchScore||0)/20)} stars`">
              <span class="badge-label">{{ t('match') }}</span>
              <span class="badge-stars" role="img" :aria-hidden="true">
                <span v-for="n in 5" :key="n" class="star" :class="{filled: n <= (show.matchStars ?? Math.round((show.matchScore||0)/20))}">★</span>
              </span>
            </div>

            <div class="info">
              <h3>{{ show.title }}</h3>
              <p class="genre">{{ show.genres.join(' • ') }}</p>

              <div class="score">
                <span>{{ t('matchScore') }}</span>
                <span class="inline-stars">
                  <span v-for="n in 5" :key="'s-'+n+show.id" class="star small" :class="{filled: n <= (show.matchStars ?? Math.round((show.matchScore||0)/20))}">★</span>
                  <strong class="stars-label">{{ show.matchStars ?? Math.round((show.matchScore||0)/20) }}/5</strong>
                </span>
              </div>

              <p class="reason">
                <span v-if="show.becauseIsTitle">{{ t('becauseLiked') }} <b>{{ show.because }}</b></span>
                <span v-else>{{ show.because }}</span>
              </p>

              <router-link
                :to="`/series/${show.localSeriesId ?? show.tmdbId}`"
                class="btn"
              >
                {{ t('viewShow') }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="load-more-wrap" v-if="recommendations.length > visible">
          <button class="load-more" @click="loadMore">{{ t('loadMore') }}</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  name: "Discover",
  data() {
    return {
      loading: true,
      isLoggedIn: false,
      recommendations: [],
      visible: 10,
      columns: 1,
      selectedGenre: '',
      selectedRating: 0,
      genres: [],
      currentLanguage: 'en'
    };
  },

  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    loadMore() {
      // Add two full rows per click (fill partial row first if needed)
      const cols = this.computeCols() || 1;
      const remainder = this.visible % cols;
      let toAdd = 0;
      if (remainder !== 0) {
        // fill the partial row
        toAdd += (cols - remainder);
        // then add two more full rows
        toAdd += cols * 2;
      } else {
        // no partial row, just add two rows
        toAdd += cols * 2;
      }
      this.visible = Math.min(this.visible + toAdd, this.recommendations.length);
    },
    computeCols() {
      const grid = this.$refs.grid;
      if (!grid) return 1;

      // Prefer measuring actual rendered cards in the first row
      const cards = grid.querySelectorAll('.show-card');
      if (cards.length > 0) {
        const firstTop = cards[0].offsetTop;
        let count = 0;
        for (let i = 0; i < cards.length; i++) {
          if (cards[i].offsetTop === firstTop) count++; else break;
        }
        if (count > 0) return count;
      }

      // Fallback to width-based calculation
      const gridWidth = grid.clientWidth;
      const minCard = 200; // card width in CSS
      return Math.max(1, Math.floor((gridWidth + 16) / (minCard + 16)));
    },

    updateColumns() {
      this.columns = this.computeCols();

      // attach resize listener once
      if (!this._hasResize) {
        window.addEventListener('resize', this.updateColumns);
        this._hasResize = true;
      }
    }

    ,clearFilters() {
      this.selectedGenre = '';
      this.selectedRating = 0;
      // reset visible to initial count (but not greater than filtered length)
      this.visible = Math.min(10, this.filteredRecommendations.length || 10);
    }
  },

  computed: {
    filteredRecommendations() {
      return this.recommendations.filter(r => {
        if (this.selectedGenre && !(r.genres || []).includes(this.selectedGenre)) return false;
        if (this.selectedRating && (r.matchStars || 0) < this.selectedRating) return false;
        return true;
      });
    },

    visibleRecommendations() {
      return this.filteredRecommendations.slice(0, this.visible);
    }
  },

  async mounted() {
    this.currentLanguage = getCurrentLanguage();
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));

      if (!auth || !auth.loggedIn || !auth.user?.id) {
        this.isLoggedIn = false;
        this.recommendations = [];
        this.loading = false;
        return;
      }

      this.isLoggedIn = true;

      const res = await fetch("http://localhost:3000/api/discover", {
        headers: {
          authorization: auth.user.id
        }
      });

      if (!res.ok) {
        this.recommendations = [];
        return;
      }

      this.recommendations = await res.json();

      // populate genre options from recommendations
      this.genres = Array.from(new Set(this.recommendations.flatMap(r => r.genres || []))).sort();

      // compute initial columns/visible after data is rendered
      this.$nextTick(() => {
        this.updateColumns();
      });
    } catch (err) {
      console.error(err);
      this.recommendations = [];
    } finally {
      this.loading = false;
    }

    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.$forceUpdate();
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateColumns);
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.$forceUpdate();
    });
  }
};
</script>

<style scoped>
.discover-page {
  overflow-x: hidden; /* prevent horizontal scroll */
  box-sizing: border-box;
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


.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* center incomplete last rows */
  gap: 1.25rem;
  align-items: flex-start;
}

.show-card {
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0.9rem; /* inset content so image aligns with .info */
  width: 200px; /* fixed card width helps centering last-row items */
  min-width: 200px;
  min-height: 460px;
  position: relative;
  border: 1px solid rgba(255,255,255,0.04);
}

.show-card:hover {
  transform: translateY(-10px) rotateX(4deg) scale(1.03);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.55);
  transition: transform 260ms cubic-bezier(.2,.9,.2,1), box-shadow 260ms ease;
  will-change: transform, box-shadow;
}

.show-card img {
  width: 100%;
  aspect-ratio: 2 / 3; /* flexible height */
  object-fit: cover;
  display: block;
  border-radius: 10px;
  margin-bottom: 0.6rem;
  flex: 0 0 auto;
}

.show-card:hover {
  transform: translateY(-10px) rotateX(4deg) scale(1.03);
  box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.02) inset;
}

.match-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  padding: 4px 8px;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(255,61,129,0.06);
  transform-origin: center;
  animation: badgePop 600ms ease;
  z-index: 6;
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.match-badge .badge-label {
  font-size: 0.62rem;
  opacity: 0.95;
}
.match-badge .badge-value {
  font-size: 0.85rem;
  font-weight: 900;
  line-height: 1;
}
.badge-ring { width: 24px; height: 24px; opacity: 0.18; margin-left: 4px; flex-shrink: 0 }
.badge-ring .progress { transform-origin: center; transition: stroke-dasharray 800ms ease; stroke: rgba(0,0,0,0.12); }

.star { color: rgba(255,255,255,0.18); font-size: 1rem; line-height: 1; }
.star.filled { color: var(--accent-color); text-shadow: 0 1px 0 rgba(0,0,0,0.18); animation: starGlow 2200ms ease-in-out infinite; }
.star.small { font-size: 0.9rem; margin-right: 2px; }
.badge-stars { display:inline-flex; align-items:center; gap:4px }
.stars-label { margin-left:6px; font-weight:700; font-size:0.85rem; color:#fff }

@keyframes badgePop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes starGlow {
  0% { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); transform: translateY(0) scale(1); }
  40% { filter: drop-shadow(0 6px 10px rgba(0,0,0,0.12)); transform: translateY(-1px) scale(1.06); }
  80% { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); transform: translateY(0) scale(1); }
  100% { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); transform: translateY(0) scale(1); }
}

.info {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.info h3 {
  font-size: clamp(1rem, 2vw, 1.2rem);
  margin-bottom: 0.25rem;
  word-break: break-word; /* prevents overflow */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.genre {
  font-size: clamp(0.72rem, 1.1vw, 0.9rem);
  opacity: 0.8;
  margin-bottom: 0.5rem;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 1.3em; /* reserve single-line height */
}

.score {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-size: clamp(0.75rem, 1.5vw, 0.9rem);
  min-height: 1.2em;
}

.reason {
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  opacity: 0.85;
  margin-bottom: 1rem;
  line-height: 1.2em;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* reserve space for 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
}

.btn {
  display: block;
  text-align: center;
  padding: 0.6rem;
  border-radius: 8px;
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  font-weight: bold;
  text-decoration: none;
  margin-top: auto; /* push button to bottom */
  font-size: clamp(0.85rem, 1.5vw, 1rem);
}

.load-more-wrap {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0 2.5rem;
}
.load-more {
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  border: none;
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.45);
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
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
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

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

.clear-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.3);
}

.load-more:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.5);
  opacity: 0.98;
}

.loading,
.empty {
  text-align: center;
  margin-top: 3rem;
  opacity: 0.8;
  font-size: clamp(1rem, 2vw, 1.2rem);
}

.show-card {
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0.9rem;
  width: 200px;
  min-width: 200px;
  min-height: 460px;
  position: relative;
  border: 1px solid rgba(255,255,255,0.04);
  animation: fadeUp 360ms cubic-bezier(.16,.84,.24,1) forwards;
  opacity: 0;
  will-change: transform, opacity;
  /* faster stagger to avoid long sequential pop-in */
  animation-delay: calc(var(--i) * 36ms);
}

@keyframes fadeUp {
  /* pop + rotate entrance (faster feel) */
  0% {
    opacity: 0;
    transform: translateY(18px) rotateX(10deg) scale(0.985);
    filter: blur(4px) saturate(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) rotateX(3deg) scale(1.01);
    filter: blur(0px) saturate(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg) scale(1);
    filter: blur(0px) saturate(1);
  }
}

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}



.login-prompt-section {
  text-align: center;
  padding: 4rem 1.5rem;
  background: linear-gradient(135deg, rgba(30, 28, 39, 0.8) 0%, rgba(18, 20, 20, 0.8) 100%);
  border: 1.5px dashed rgba(112, 233, 116, 0.2);
  border-radius: 14px;
  margin: 2rem auto;
  max-width: 500px;
  animation: fadeInSection 600ms cubic-bezier(0.16, 0.84, 0.24, 1) forwards;
  opacity: 0;
}

@keyframes fadeInSection {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.lock-icon {
  font-size: 4rem;
  margin-bottom: 1.25rem;
  display: inline-block;
  animation: lockBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms forwards;
  opacity: 0;
}

@keyframes lockBounce {
  0% {
    opacity: 0;
    transform: scale(0.2) translateY(-20px);
  }
  70% {
    transform: scale(1.15) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.login-prompt-section h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  color: var(--text-color);
  font-weight: 700;
  animation: fadeInSection 600ms cubic-bezier(0.16, 0.84, 0.24, 1) 200ms forwards;
  opacity: 0;
}

.login-prompt-section p {
  margin: 0 0 1.5rem 0;
  color: var(--subtitle-color);
  opacity: 0.85;
  font-size: 1rem;
  line-height: 1.5;
  animation: fadeInSection 600ms cubic-bezier(0.16, 0.84, 0.24, 1) 300ms forwards;
  opacity: 0;
}

.login-btn {
  display: inline-block;
  padding: 0.9rem 2rem;
  background: linear-gradient(to right, var(--gradient-start), var(--medium-bg-color));
  color: var(--text-color);
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.05rem;
  transition: all 300ms cubic-bezier(0.2, 0.9, 0.2, 1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(112, 233, 116, 0.2);
  pointer-events: auto;
  cursor: pointer;
  animation: fadeInSection 600ms cubic-bezier(0.16, 0.84, 0.24, 1) 400ms forwards;
  opacity: 0;
}

.login-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(112, 233, 116, 0.15);
  border-color: rgba(112, 233, 116, 0.4);
}

.login-btn:active {
  transform: translateY(-2px);
}

</style>
