<template>
  <div id="public-profile-page">
    <div class="profile-container" v-if="user">
      <!-- Header Section -->
      <header class="hero">
        <div class="hero-band">
          <div class="hero-inner">
            <h1>{{ user.username }}'s Profile</h1>
            <p class="subtitle">{{ reviewCount }} reviews • {{ followedShowsCount }} followed shows</p>
          </div>
        </div>
      </header>

      <div class="profile-content">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="pfp-section">
              <img 
                class="profile-icon" 
                :src="user.profile_picture || '/assets/user_pfp/defaultpfp.jpg'"
                :alt="user.username"
              />
              <img v-if="user.role === 'admin'" src="../assets/admin_gear.png" alt="admin icon" class="admin-icon"/>
              
              <!-- Display selected badge -->
              <div v-if="selectedBadge" class="badge-display">
                <span class="badge-emoji">{{ selectedBadge.icon_emoji }}</span>
              </div>
            </div>

            <div class="user-details">
              <div class="username-section">
                <h2 class="username">
                  {{ user.username }}
                  <span v-if="user.role === 'admin'" class="admin-label">(ADMIN)</span>
                </h2>
              </div>

              <button v-if="isOwnProfile" class="edit-profile-btn" @click="$router.push('/profile')">
                ⚙️ Edit Profile
              </button>
            </div>
          </div>
        </div>

        <!-- Badges Section -->
        <section v-if="badges.length > 0" class="section">
          <h2 class="section-title">🏅 Earned Badges</h2>
          <div class="badges-grid">
            <div v-for="badge in badges" :key="badge.id" class="badge-card" :class="{ selected: selectedBadge?.id === badge.id }">
              <span class="badge-icon">{{ badge.icon_emoji }}</span>
              <div class="badge-info">
                <p class="badge-title">{{ badge.title }}</p>
                <p class="badge-earned">{{ formatDate(badge.earned_at) }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Public Lists Section -->
        <section v-if="publicLists.length > 0" class="section">
          <h2 class="section-title">📋 Lists</h2>
          <div class="lists-grid">
            <div v-for="list in publicLists" :key="list.id" class="list-card">
              <h3>{{ list.name }}</h3>
              <p class="list-desc">{{ list.description }}</p>
              <div class="list-items">
                <div v-for="item in list.items || []" :key="item.id" class="list-item">
                  📺
                </div>
              </div>
              <p class="item-count">{{ list.items ? list.items.length : 0 }} shows</p>
            </div>
          </div>
        </section>

        <!-- Followed Shows Section -->
        <section v-if="followedShows.length > 0" class="section">
          <h2 class="section-title">⭐ Followed Shows ({{ followedShows.length }})</h2>
          <div class="shows-grid">
            <div v-for="show in followedShows.slice(0, 6)" :key="show.tmdb_series_id" class="show-card">
              <div class="show-icon">📺</div>
              <p class="show-id">Series ID: {{ show.tmdb_series_id }}</p>
            </div>
          </div>
        </section>

        <!-- Reviews Section -->
        <section v-if="userReviews.length > 0" class="section">
          <h2 class="section-title">📝 Recent Reviews</h2>
          <div class="reviews-grid">
            <div 
              v-for="review in userReviews.slice(0, 6)" 
              :key="review.id" 
              class="review-card"
              @click="$router.push(`/review/${review.id}`)"
            >
              <img v-if="review.episode_image" :src="review.episode_image" :alt="review.episode_title" class="episode-img"/>
              <div v-else class="episode-img-placeholder">📺</div>
              <div class="review-info">
                <p class="episode-title">S{{ review.season_number }}E{{ review.episode_number }}</p>
                <p class="series-name">{{ review.series_title }}</p>
                <span class="rating" :class="`rating-${Math.round(review.rating)}`">
                  ★ {{ review.rating }}/5
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Comments Section -->
        <section v-if="userComments.length > 0" class="section">
          <h2 class="section-title">💬 Posted Comments</h2>
          <div class="comments-list">
            <div v-for="comment in userComments.slice(0, 5)" :key="comment.id" class="comment-card">
              <p class="comment-text">{{ comment.comment_text }}</p>
              <p class="comment-meta">On review: {{ comment.review_title }}</p>
            </div>
          </div>
        </section>

        <!-- Empty State -->
        <div v-if="!hasContent" class="empty-state">
          <p>No public activity yet</p>
        </div>
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
      user: null,
      publicLists: [],
      badges: [],
      selectedBadge: null,
      followedShows: [],
      userReviews: [],
      userComments: [],
      reviewCount: 0,
      followedShowsCount: 0,
      isOwnProfile: false,
      auth: null
    };
  },
  computed: {
    hasContent() {
      return this.badges.length > 0 || this.publicLists.length > 0 || 
             this.userReviews.length > 0 || this.userComments.length > 0;
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, 'en');
    },
    async loadProfile() {
      const userId = this.$route.params.userId;
      
      try {
        // Fetch public profile
        const profileRes = await fetch(`/api/users/${userId}/public-profile`);
        if (!profileRes.ok) {
          alert('User not found');
          this.$router.push('/');
          return;
        }

        const profileData = await profileRes.json();
        this.user = profileData.user;
        this.publicLists = profileData.publicLists || [];
        this.badges = profileData.badges || [];
        this.reviewCount = profileData.reviewCount || 0;
        this.followedShowsCount = profileData.followedShowsCount || 0;
        
        // Set selected badge
        if (this.user.selected_badge_id) {
          this.selectedBadge = this.badges.find(b => b.id === this.user.selected_badge_id);
        } else if (this.badges.length > 0) {
          this.selectedBadge = this.badges[0];
        }

        // Check if this is the logged-in user's profile
        const authData = localStorage.getItem('auth');
        this.auth = authData ? JSON.parse(authData) : null;
        this.isOwnProfile = this.auth?.user?.id === parseInt(userId);

        // Fetch additional data
        await Promise.all([
          this.loadFollowedShows(userId),
          this.loadUserReviews(userId),
          this.loadUserComments(userId)
        ]);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    },
    async loadFollowedShows(userId) {
      try {
        const res = await fetch(`/api/followed-shows/${userId}`);
        this.followedShows = await res.json();
      } catch (err) {
        console.error('Error loading followed shows:', err);
      }
    },
    async loadUserReviews(userId) {
      try {
        const res = await fetch(`/api/user-reviews/${userId}`);
        this.userReviews = await res.json();
      } catch (err) {
        console.error('Error loading user reviews:', err);
      }
    },
    async loadUserComments(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/comments`);
        this.userComments = await res.json();
      } catch (err) {
        console.error('Error loading user comments:', err);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  },
  mounted() {
    this.loadProfile();
  }
};
</script>

<style scoped>
#public-profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--dark-bg-color, #0f0f0f) 0%, var(--dark-bg-alt, #1a1a1a) 100%);
}

.hero {
  background: linear-gradient(135deg, #ff6b6b 0%, #9370db 100%);
  padding: 3rem 1rem;
  margin-bottom: 2rem;
}

.hero-band {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-inner {
  text-align: center;
  color: white;
}

.hero-inner h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.profile-header {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.pfp-section {
  position: relative;
  flex-shrink: 0;
}

.profile-icon {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff6b6b;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
}

.admin-icon {
  width: 30px;
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 5px;
}

.badge-display {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  border: 2px solid #ffa500;
}

.badge-emoji {
  font-size: 2rem;
}

.user-details {
  flex: 1;
}

.username-section {
  margin-bottom: 1rem;
}

.username {
  font-size: 2rem;
  color: #ff6b6b;
  margin: 0;
}

.admin-label {
  font-size: 0.8rem;
  color: #ffd700;
}

.edit-profile-btn {
  padding: 0.8rem 1.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.section-title {
  color: #ff6b6b;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.badge-card {
  background: rgba(147, 112, 219, 0.1);
  border: 2px solid rgba(147, 112, 219, 0.3);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.badge-card:hover {
  transform: translateY(-4px);
  border-color: #9370db;
}

.badge-card.selected {
  background: rgba(255, 215, 0, 0.2);
  border: 2px solid #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.badge-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.badge-title {
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.badge-earned {
  color: #999;
  font-size: 0.85rem;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.list-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-card:hover {
  transform: translateY(-4px);
  border-color: #ff6b6b;
}

.list-card h3 {
  color: #ff6b6b;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.list-desc {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.list-items {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.list-item {
  font-size: 1.2rem;
}

.item-count {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

.shows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.show-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.show-card:hover {
  transform: translateY(-4px);
  border-color: #ff6b6b;
}

.show-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.show-id {
  color: #999;
  font-size: 0.85rem;
  margin: 0;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.review-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-4px);
  border-color: #ff6b6b;
}

.episode-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  background: linear-gradient(135deg, #ff6b6b, #9370db);
}

.episode-img-placeholder {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #ff6b6b, #9370db);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.review-info {
  padding: 1rem;
}

.episode-title {
  color: #ff6b6b;
  font-weight: 600;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.series-name {
  color: #ddd;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.rating {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.rating-1, .rating-2 { background: #d32f2f; }
.rating-3 { background: #f57c00; }
.rating-4 { background: #fbc02d; }
.rating-5 { background: #388e3c; }

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.comment-text {
  color: #ddd;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.comment-meta {
  color: #999;
  font-size: 0.85rem;
  margin: 0;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
  font-size: 1.1rem;
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
  .hero-inner h1 {
    font-size: 1.8rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-icon {
    width: 120px;
    height: 120px;
  }

  .badges-grid,
  .lists-grid,
  .shows-grid,
  .reviews-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
