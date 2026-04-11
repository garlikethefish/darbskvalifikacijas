<template>
  <div id="review-detail-page">
    <div class="review-detail-container" v-if="review">
      <!-- Header with series info -->
      <div class="review-header">
        <div class="series-poster">
          <img v-if="seriesInfo?.poster_path" :src="`https://image.tmdb.org/t/p/w300${seriesInfo.poster_path}`" :alt="seriesInfo?.name">
          <div v-else class="no-poster">📺</div>
        </div>
        
        <div class="header-content">
          <h1>{{ seriesInfo?.name || 'Series' }}</h1>
          <p class="episode-label">Season {{ review.season_number }} Episode {{ review.episode_number }}</p>
          <p class="episode-title">{{ episodeInfo?.name || `Episode ${review.episode_number}` }}</p>
          
          <div class="review-meta">
            <span class="rating-badge" :class="`rating-${Math.round(review.rating)}`">
              ★ {{ review.rating }}/5
            </span>
            <span class="author">
              By <router-link :to="`/public-profile/${review.user_id}`" class="author-link">{{ review.username }}</router-link>
            </span>
            <span class="date">{{ formatDate(review.date) }}</span>
          </div>

          <p class="review-synopsis" v-if="episodeInfo?.overview">{{ episodeInfo.overview }}</p>
        </div>
      </div>

      <!-- Review Title and Text -->
      <div class="review-content">
        <h2 class="review-title">{{ review.review_title }}</h2>
        <p class="review-text">{{ review.review_text }}</p>

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
        <h3>{{ t('comments') }} ({{ comments.length }})</h3>

        <!-- Add comment form -->
        <div v-if="auth?.loggedIn" class="comment-form">
          <textarea 
            v-model="newComment" 
            placeholder="Share your thoughts..."
            class="comment-input"
            @keydown.enter.ctrl="addComment"
          ></textarea>
          <button @click="addComment" class="submit-btn" :disabled="!newComment.trim()">
            {{ t('post') }}
          </button>
        </div>
        <p v-else class="login-prompt">
          <router-link to="/login">{{ t('login') }}</router-link> to comment
        </p>

        <!-- Comments list -->
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <img :src="comment.profile_picture || '/assets/user_pfp/defaultpfp.jpg'" :alt="comment.username" class="comment-avatar">
              <div class="comment-meta">
                <router-link :to="`/public-profile/${comment.id}`" class="comment-author">{{ comment.username }}</router-link>
                <span class="comment-date">{{ formatDate(comment.date) }}</span>
              </div>
            </div>
            <p class="comment-text">{{ comment.comment_text }}</p>
          </div>
        </div>
      </div>

      <!-- Series Info Card -->
      <div class="series-card" v-if="seriesInfo">
        <h3>About {{ seriesInfo.name }}</h3>
        <p><strong>Status:</strong> {{ seriesInfo.status }}</p>
        <p><strong>Seasons:</strong> {{ seriesInfo.number_of_seasons }}</p>
        <p><strong>Episodes:</strong> {{ seriesInfo.number_of_episodes }}</p>
        <p v-if="seriesInfo.genres" class="genres">
          <strong>Genres:</strong> {{ seriesInfo.genres.map(g => g.name).join(', ') }}
        </p>
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
import { getTranslation } from '@/services/translations.js'

export default {
  data() {
    return {
      review: null,
      seriesInfo: null,
      episodeInfo: null,
      comments: [],
      newComment: '',
      isLiked: false,
      isDisliked: false,
      auth: null
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.auth?.language || 'en');
    },
    async fetchReviewData() {
      const reviewId = this.$route.params.reviewId;
      try {
        const res = await fetch(`/api/reviews/${reviewId}`);
        const data = await res.json();
        
        if (!res.ok) {
          alert('Review not found');
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
        alert('Failed to load review');
      }
    },
    async toggleLike() {
      if (!this.auth?.loggedIn) {
        alert('Please login to react');
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
        alert('Please login to react');
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
      return date.toLocaleDateString();
    }
  },
  mounted() {
    const authData = localStorage.getItem('auth');
    this.auth = authData ? JSON.parse(authData) : null;
    this.fetchReviewData();
  }
};
</script>

<style scoped>
#review-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--dark-bg-color, #0f0f0f) 0%, var(--dark-bg-alt, #1a1a1a) 100%);
  padding: 2rem 1rem;
}

.review-detail-container {
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.review-header {
  display: flex;
  gap: 2rem;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(147, 112, 219, 0.1) 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.series-poster {
  flex-shrink: 0;
  width: 200px;
}

.series-poster img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.no-poster {
  width: 100%;
  aspect-ratio: 2/3;
  background: linear-gradient(135deg, #ff6b6b, #9370db);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.header-content {
  flex: 1;
}

.header-content h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #ff6b6b;
}

.episode-label {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.episode-title {
  font-size: 1.3rem;
  color: #ccc;
  margin-bottom: 1rem;
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
}

.rating-1, .rating-2 { background: #d32f2f; }
.rating-3 { background: #f57c00; }
.rating-4 { background: #fbc02d; }
.rating-5 { background: #388e3c; }

.author-link {
  color: #ff6b6b;
  text-decoration: none;
  font-weight: 600;
}

.author-link:hover {
  text-decoration: underline;
}

.date {
  color: #999;
  font-size: 0.9rem;
}

.review-synopsis {
  color: #aaa;
  line-height: 1.6;
  font-style: italic;
}

.review-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-title {
  color: #ff6b6b;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.review-text {
  color: #ddd;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.episode-still {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-top: 1rem;
  object-fit: cover;
}

.reactions-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.reaction-btn {
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(255, 107, 107, 0.3);
  background: rgba(255, 107, 107, 0.05);
  color: #ff6b6b;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reaction-btn:hover {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.reaction-btn.active {
  background: #ff6b6b;
  color: white;
}

.comments-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-section h3 {
  color: #ff6b6b;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
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
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 6px;
  color: #ddd;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: #ff6b6b;
  background: rgba(0, 0, 0, 0.5);
}

.submit-btn {
  padding: 0.8rem 1.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-prompt {
  color: #999;
  font-style: italic;
  margin-bottom: 1rem;
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
  border: 1px solid rgba(255, 255, 255, 0.05);
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
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.comment-author {
  color: #ff6b6b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.comment-author:hover {
  text-decoration: underline;
}

.comment-date {
  color: #666;
  font-size: 0.8rem;
}

.comment-text {
  color: #ccc;
  line-height: 1.6;
  margin: 0;
}

.series-card {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(147, 112, 219, 0.2);
}

.series-card h3 {
  color: #9370db;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.series-card p {
  color: #aaa;
  margin-bottom: 0.8rem;
  line-height: 1.6;
}

.series-card .genres {
  color: #ff6b6b;
  font-weight: 600;
}

.series-card .overview {
  color: #999;
  font-style: italic;
  margin-top: 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 107, 107, 0.2);
  border-top-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .review-header {
    flex-direction: column;
    gap: 1rem;
  }

  .series-poster {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .review-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
