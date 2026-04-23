<template>
  <div id="app">
    <!-- Hero Section -->
    <header class="hero" v-if="review">
      <div class="hero-band">
        <div class="hero-inner">
          <h1>{{ seriesInfo?.name || t('series') }}</h1>
          <p v-if="showSeriesEnglishSubtitle" class="english-subtitle">{{ seriesInfo?.english_name }}</p>
          <p class="subtitle">{{ t('season') }} {{ review.season_number }} {{ t('episode') }} {{ review.episode_number }} — {{ episodeInfo?.name || `${t('episode')} ${review.episode_number}` }}</p>
        </div>
      </div>
    </header>

    <div class="review-detail-container" v-if="review">
      <!-- Review Header Card -->
      <div class="review-header">
        <div class="series-poster">
          <img v-if="seriesInfo?.poster_path" :src="`https://image.tmdb.org/t/p/w300${seriesInfo.poster_path}`" :alt="seriesInfo?.name">
          <div v-else class="no-poster"><SvgIcon name="monitor" :size="64" /></div>
        </div>
        
        <div class="header-content">
          <div class="review-meta">
            <span class="rating-badge" :class="`rating-${Math.round(review.rating)}`">
              <SvgIcon
                v-for="n in 5"
                :key="'star-' + n"
                name="star"
                :size="20"
                :weight="n <= review.rating ? 'Bold' : 'Linear'"
                class="rating-star"
              />
              <span class="rating-number">{{ review.rating }}/5</span>
            </span>
            <span class="author">
              {{ t('by') }} <router-link :to="`/profile/${review.user_id}`" class="author-link">{{ review.username }}</router-link>
            </span>
            <span class="date">{{ formatDate(review.date) }}</span>
          </div>

          <p class="review-synopsis" v-if="episodeInfo?.overview">{{ episodeInfo.overview }}</p>
        </div>
      </div>

      <!-- Review Title and Text -->
      <div class="review-content">
        <SectionHeader>{{ review.review_title }}</SectionHeader>
        <label v-if="showTranslateReviewToggle" class="translate-toggle">
          <input type="checkbox" v-model="translateReviewText">
          <span>{{ t('machineTranslateReviews') }}</span>
        </label>
        <p class="review-text">{{ displayedReviewText }}</p>
        <p v-if="translateReviewText && translatingReviewText" class="translation-note">{{ t('translating') }}</p>
        <p v-else-if="translateReviewText && translatedReviewText" class="translation-note">{{ t('showingMachineTranslatedReview') }}</p>
        <p v-else-if="translateReviewText && translationError" class="translation-note translation-note-error">{{ t('translationUnavailable') }}</p>

        <!-- Episode Still -->
        <img v-if="episodeInfo?.still_path" :src="`https://image.tmdb.org/t/p/w500${episodeInfo.still_path}`" :alt="episodeInfo?.name" class="episode-still">
      </div>

      <!-- Reactions -->
      <div class="reactions-section">
        <button @click="toggleLike" class="reaction-btn like-btn" :class="{ active: isLiked }">
          👍 {{ review.likes }}
        </button>
        <button @click="toggleDislike" class="reaction-btn dislike-btn" :class="{ active: isDisliked }">
          👎 {{ review.dislikes }}
        </button>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <SectionHeader><SvgIcon name="chat" :size="22" /> {{ t('comments') }} ({{ comments.length }})</SectionHeader>

        <!-- Add comment form -->
        <div v-if="auth?.loggedIn" class="comment-form">
          <textarea 
            v-model="newComment" 
            :placeholder="t('shareYourThoughts')"
            class="comment-input"
            @keydown.enter.ctrl="addComment"
          ></textarea>
          <button @click="addComment" class="submit-btn" :disabled="!newComment.trim()">
            {{ t('post') }}
          </button>
        </div>
        <p v-else class="login-prompt">
          <router-link to="/login">{{ t('login') }}</router-link> {{ t('loginToComment') }}
        </p>

        <!-- Comments list -->
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <img :src="comment.profile_picture || '/assets/default_pfp_icons/default_grey.png'" :alt="comment.username" class="comment-avatar" @error="$event.target.src = '/assets/default_pfp_icons/default_grey.png'">
              <div class="comment-meta">
                <router-link :to="`/profile/${comment.user_id}`" class="comment-author">{{ comment.username }}</router-link>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
            </div>
            <p class="comment-text">{{ comment.comment_text }}</p>
          </div>
        </div>
      </div>

      <!-- Series Info Card -->
      <div class="series-card" v-if="seriesInfo">
        <SectionHeader>{{ t('aboutSeries') }} {{ seriesInfo.name }}</SectionHeader>
        <div class="series-details">
          <p><strong>{{ t('status') }}:</strong> {{ seriesInfo.status }}</p>
          <p><strong>{{ t('seasons') }}:</strong> {{ seriesInfo.number_of_seasons }}</p>
          <p><strong>{{ t('episodes') }}:</strong> {{ seriesInfo.number_of_episodes }}</p>
          <p v-if="seriesInfo.genres" class="genres">
            <strong>{{ t('genres') }}:</strong> {{ seriesInfo.genres.map(g => g.name).join(', ') }}
          </p>
        </div>
        <p class="overview">{{ seriesInfo.overview }}</p>
      </div>
    </div>

    <div v-else class="loading">
      <div class="spinner"></div>
      <p>{{ t('loading') }}...</p>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'
import SvgIcon from '@/components/SvgIcon.vue'
import SectionHeader from '@/components/SectionHeader.vue'

export default {
  components: { SvgIcon, SectionHeader },
  data() {
    return {
      review: null,
      seriesInfo: null,
      episodeInfo: null,
      comments: [],
      newComment: '',
      isLiked: false,
      isDisliked: false,
      auth: null,
      currentLanguage: 'en',
      translateReviewText: false,
      translatedReviewText: '',
      translatedForLanguage: '',
      translatingReviewText: false,
      translationError: false
    };
  },
  computed: {
    isLatvian() {
      return String(this.currentLanguage || '').toLowerCase().startsWith('lv');
    },
    currentAppLanguage() {
      return this.isLatvian ? 'lv' : 'en';
    },
    reviewLanguage() {
      const raw = String(this.review?.review_language || '').toLowerCase();
      return raw === 'lv' || raw === 'en' ? raw : 'unknown';
    },
    showTranslateReviewToggle() {
      return this.reviewLanguage === 'unknown' || this.reviewLanguage !== this.currentAppLanguage;
    },
    showSeriesEnglishSubtitle() {
      const localized = (this.seriesInfo?.name || '').trim();
      const english = (this.seriesInfo?.english_name || '').trim();
      return this.isLatvian && english && localized && english !== localized;
    },
    displayedReviewText() {
      if (this.translateReviewText && this.translatedReviewText) {
        return this.translatedReviewText;
      }
      return this.review?.review_text || '';
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    async fetchReviewData() {
      const reviewId = this.$route.params.reviewId;
      try {
        const res = await fetch(`/api/reviews/${reviewId}?lang=${encodeURIComponent(this.currentLanguage)}`);
        const data = await res.json();
        
        if (!res.ok) {
          alert(this.t('reviewNotFound'));
          this.$router.push('/reviews');
          return;
        }

        this.review = data.review;
        this.seriesInfo = data.seriesInfo;
        this.episodeInfo = data.episodeInfo;
        this.comments = data.comments || [];

        // Check if current user liked/disliked
        if (this.auth?.loggedIn && this.review) {
          // This could be fetched from a separate endpoint if needed
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        alert(this.t('failedToLoadReview'));
      }
    },
    async toggleLike() {
      if (!this.auth?.loggedIn) {
        alert(this.t('pleaseLoginToReact'));
        return;
      }

      try {
        const res = await fetch(`/api/reviews/${this.review.id}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.auth.user.id.toString()
          },
          body: JSON.stringify({ is_like: true })
        });

        const data = await res.json();
        this.review.likes = data.likes;
        this.review.dislikes = data.dislikes;
        this.isLiked = !this.isLiked;
        this.isDisliked = false;
      } catch (err) {
        console.error('Error liking review:', err);
      }
    },
    async toggleDislike() {
      if (!this.auth?.loggedIn) {
        alert(this.t('pleaseLoginToReact'));
        return;
      }

      try {
        const res = await fetch(`/api/reviews/${this.review.id}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.auth.user.id.toString()
          },
          body: JSON.stringify({ is_like: false })
        });

        const data = await res.json();
        this.review.likes = data.likes;
        this.review.dislikes = data.dislikes;
        this.isDisliked = !this.isDisliked;
        this.isLiked = false;
      } catch (err) {
        console.error('Error disliking review:', err);
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;

      try {
        const res = await fetch(`/api/reviews/${this.review.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.auth.user.id.toString()
          },
          body: JSON.stringify({ comment_text: this.newComment })
        });

        if (res.ok) {
          this.newComment = '';
          await this.fetchReviewData();
        }
      } catch (err) {
        console.error('Error adding comment:', err);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.currentLanguage === 'lv' ? 'lv-LV' : 'en-US');
    },
    async maybeTranslateReviewText() {
      if (!this.showTranslateReviewToggle) {
        if (this.translateReviewText) {
          this.translateReviewText = false;
        }
        this.translationError = false;
        return;
      }

      if (!this.translateReviewText) {
        this.translationError = false;
        return;
      }

      const text = (this.review?.review_text || '').trim();
      const targetLanguage = this.currentAppLanguage;
      const sourceLanguage = this.reviewLanguage === 'unknown'
        ? (targetLanguage === 'lv' ? 'en' : 'lv')
        : this.reviewLanguage;

      if (!text) return;
      if (this.translatedReviewText && this.translatedForLanguage === targetLanguage) return;

      this.translatingReviewText = true;
      this.translationError = false;

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text, sourceLanguage, targetLanguage })
        });

        if (!res.ok) {
          throw new Error('Translate failed');
        }

        const data = await res.json();
        this.translatedReviewText = data?.translatedText || '';
        this.translatedForLanguage = targetLanguage;
      } catch (error) {
        console.error('Review detail translation failed:', error);
        this.translationError = true;
      } finally {
        this.translatingReviewText = false;
      }
    }
  },
  watch: {
    translateReviewText: {
      immediate: true,
      handler() {
        this.maybeTranslateReviewText();
      }
    },
    currentLanguage() {
      this.maybeTranslateReviewText();
    },
    review: {
      deep: true,
      handler() {
        this.translatedReviewText = '';
        this.translatedForLanguage = '';
        this.translationError = false;
        this.maybeTranslateReviewText();
      }
    }
  },
  mounted() {
    const authData = localStorage.getItem('auth');
    this.auth = authData ? JSON.parse(authData) : null;
    this.currentLanguage = getCurrentLanguage();
    this._languageChangedHandler = (e) => {
      this.currentLanguage = e.detail.language;
      this.fetchReviewData();
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
    this.fetchReviewData();
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
  }
};
</script>

<style scoped>
/* Hero Section */
.hero {
  color: var(--text-color);
  margin-bottom: 40px;
  overflow: hidden;
}

.hero-band {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  background: var(--hero-gradient);
  padding: 60px 0;
  box-shadow: var(--hero-shadow);
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
  0%   { transform: translateX(-80%); opacity: 0.45; }
  50%  { transform: translateX(0%);   opacity: 1; }
  100% { transform: translateX(80%);  opacity: 0.45; }
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
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  color: var(--subtitle-color);
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) 100ms both;
}

.english-subtitle {
  margin: -4px 0 10px;
  color: var(--subtitle-color);
  font-size: 0.95rem;
}

@keyframes heroIntro {
  0%   { opacity: 0; transform: translateY(8px) scale(0.992); filter: blur(4px); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0); }
}

/* Container */
.review-detail-container {
  max-width: 900px;
  margin: 0 auto 60px auto;
  padding: 0 20px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Review Header */
.review-header {
  display: flex;
  gap: 2rem;
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.series-poster {
  flex-shrink: 0;
  width: 200px;
}

.series-poster img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.no-poster {
  width: 100%;
  aspect-ratio: 2/3;
  background: var(--medium-bg-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--subtitle-color);
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.review-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.rating-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.rating-star {
  color: var(--accent-color);
}

.rating-number {
  margin-left: 0.3rem;
}

.rating-1 { background: #ff4c4c; }
.rating-2 { background: #ff884c; }
.rating-3 { background: #ffd93d; color: #333; }
.rating-4 { background: #a6e22e; color: #333; }
.rating-5 { background: #38c172; }

.author {
  color: var(--subtitle-color);
}

.author-link {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
}

.author-link:hover {
  text-decoration: underline;
}

.date {
  color: var(--subtitle-color);
  font-size: 0.9rem;
}

.review-synopsis {
  color: var(--subtitle-color);
  line-height: 1.6;
  font-style: italic;
  margin: 0;
}

/* Review Content */
.review-content {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.review-text {
  color: var(--text-color);
  line-height: 1.8;
  margin: 0 0 1rem 0;
}

.translate-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 600;
}

.translate-toggle input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.translation-note {
  margin-top: 10px;
  margin-bottom: 0;
  font-size: 0.9rem;
  color: var(--subtitle-color);
  font-style: italic;
}

.translation-note-error {
  color: #e38f8f;
}

.episode-still {
  width: 100%;
  max-height: 400px;
  border-radius: 12px;
  margin-top: 1rem;
  object-fit: cover;
}

/* Reactions */
.reactions-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.reaction-btn {
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(112, 233, 116, 0.3);
  background: rgba(112, 233, 116, 0.05);
  color: var(--accent-color);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reaction-btn:hover {
  border-color: var(--accent-color);
  background: rgba(112, 233, 116, 0.1);
  transform: translateY(-2px);
}

.like-btn.active {
  background: var(--accent-color);
  color: var(--dark-bg-color);
  border-color: var(--accent-color);
}

.dislike-btn.active {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgb(255, 100, 100);
  color: rgb(255, 100, 100);
}

/* Comments Section */
.comments-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 8px;
  color: var(--text-color);
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  box-sizing: border-box;
}

.comment-input:focus {
  outline: none;
  border-color: var(--accent-color);
  background: rgba(0, 0, 0, 0.5);
}

.submit-btn {
  padding: 0.8rem 1.5rem;
  background: var(--accent-color);
  color: var(--dark-bg-color);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--medium-bg-color);
  color: var(--text-color);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-prompt {
  color: var(--subtitle-color);
  font-style: italic;
  margin-bottom: 1rem;
}

.login-prompt a {
  color: var(--accent-color);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.comment-item:hover {
  border-color: var(--accent-color);
  background: rgba(166, 226, 46, 0.05);
}

.comment-header {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent-color);
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.comment-author {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.comment-author:hover {
  text-decoration: underline;
}

.comment-date {
  color: var(--subtitle-color);
  font-size: 0.8rem;
}

.comment-text {
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

/* Series Card */
.series-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 2rem;
}

.series-details p {
  color: var(--subtitle-color);
  margin-bottom: 0.6rem;
  line-height: 1.6;
}

.series-details strong {
  color: var(--text-color);
}

.genres {
  color: var(--accent-color) !important;
  font-weight: 600;
}

.overview {
  color: var(--subtitle-color);
  font-style: italic;
  margin-top: 1rem;
  line-height: 1.7;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1rem;
  color: var(--text-color);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 2rem;
  }

  .review-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }

  .series-poster {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .review-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 500px) {
  .hero-inner h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>
