<template>
  <div class="review-wrapper">
    <div class="review-box">
      <div class="review-container" :class="{ 'no-bottom-padding': showComments }" @mouseenter="isHoveringReview = true" 
     @mouseleave="isHoveringReview = false">
        
        <div class="series-section">
          <div class="series-image-wrapper">
            <img class="square-img" :src="getEpisodePictureUrl(review.episode_picture)" alt="Episode image" />
            <div class="image-overlay"></div>
          </div>
          <h1 class="series-title">{{ review.series_title || 'Series Title' }}</h1>
          <h2 class="season-episode">{{ formatSeasonEpisode(review) }}</h2>
          <div class="avg-rating-card">
            <p class="avg-label">Community Rating</p>
            <p class="avg-score">{{ (Number(review.average_rating) || 0).toFixed(1) }}<span>/5</span></p>
            <div class="rating">
              <img
                v-for="n in 5"
                :key="n"
                class="star-avg"
                :src="n <= avgStars ? starAvgFull : starEmpty"
                alt="average show star rating"
              />
            </div>
          </div>
        </div>

        <div class="right-container">
          <div class="top-section">
            <div class="user-rating-section">
              <div class="user-info">
                <img
                  class="pfp"
                  :src="getProfilePictureUrl(review.profile_picture)"
                  alt="User profile picture"
                />
                <div class="user-details">
                  <h3 class="username">{{ review.username || 'username' }}</h3>
                  <p class="user-reviews">{{ review.user_review_count || 0 }} reviews</p>
                </div>
              </div>
              <div class="user-rating">
                <span class="rating-label">Their Rating</span>
                <div class="rating-stars">
                  <img
                    v-for="n in 5"
                    :key="'user-star-' + n"
                    class="star"
                    :src="n <= review.rating ? starFull : starEmpty"
                    alt="user rating star"
                  />
                </div>
              </div>
            </div>
            <button 
              v-show="canDeleteReview || showDeleteModal"
              class="review-delete-button"
              @click.stop="showDeleteModal = true"
              title="Delete review">
              <img src="../assets/delete.png" alt="Delete" class="delete-icon"/>
            </button>
            <div v-if="showDeleteModal" class="delete-modal">
              <div class="delete-modal-content">
                <p><strong>DELETE POST!</strong><hr><br><p>Are you sure?</p><br></p>
                <div class="delete-modal-buttons">
                  <button @click="confirmDeleteReview">Yes</button>
                  <button @click="showDeleteModal = false">No</button>
                </div>
              </div>
            </div>
          </div>

          <div class="content-section">
            <h2 class="episode-title">{{ review.episode_title || 'Episode Title' }}</h2>
            <h1 class="review-title">{{ review.review_title }}</h1>
            <p class="review-text">{{ review.review_text }}</p>
          </div>

          <div class="bottom-section">
            <div class="date-container">
              <p class="date">{{ formatDate(review.date) }}</p>
            </div>

            <div class="action-buttons">
              <button class="action-btn like-btn" @click="likeReview" title="Like this review">
                <img class="small-icon" :src="heartIcon" alt="likes" />
                <span class="count">{{ review.likes }}</span>
              </button>

              <button class="action-btn dislike-btn" @click="dislikeReview" title="Dislike this review">
                <img class="small-icon" :src="brokenHeartIcon" alt="dislikes" />
                <span class="count">{{ review.dislikes }}</span>
              </button>

              <button class="action-btn comment-btn" @click="toggleComments" title="View comments">
                <img class="small-icon" id="comment-icon" :src="commentIcon"  alt="comments" />
                <span class="count">{{ review.comment_count }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showComments" class="comment-section">
        <p v-if="loading" class="loading-text">Loading comments...</p>

        <div v-else class="center-div">
          <div v-for="comment in comments" :key="comment.id" class="comment" @mouseenter="hoveredCommentId = comment.id" 
            @mouseleave="hoveredCommentId = null">
            
            <div class="comment-pfp-wrapper">
              <img
                class="comment-pfp"
                :src="getProfilePictureUrl(comment.profile_picture)"
                alt="User profile picture"
              />
              <img
                v-if="comment.username === review.username && comment.role !== 'admin'"
                src="../assets/star-op.png"
                alt="Original poster star"
                class="op-star"
              />
              <img
                v-if="comment.role === 'admin'"
                src="../assets/admin_gear.png"
                alt="Admin icon"
                class="admin-icon"
              />
            </div>
            <p><strong :class="{
              'admin-user': comment.role === 'admin',
              'op-user': comment.username === review.username && comment.role !== 'admin'}">{{ comment.username }}<span v-if="comment.role === 'admin'" class="admin-label">(ADMIN)</span>:</strong>&nbsp;{{ comment.comment_text }}
            </p>
            <div class="delete-comment-container">
              <button 
                v-if="(hoveredCommentId === comment.id && canDeleteComment(comment)) || showDeleteCommentModal === comment.id"
                class="delete-comment-button"
                @click.stop="showDeleteCommentModal = comment.id">
                <img src="../assets/delete.png" alt="Delete" class="delete-icon" />
              </button>
            </div>
            
            <div v-if="showDeleteCommentModal === comment.id" class="delete-modal">
            <div class="delete-modal-content">
              <p><strong>DELETE COMMENT!</strong><hr><br><p>Are you sure?</p><br></p>
              <div class="delete-modal-buttons">
                <button @click="confirmDeleteComment(comment.id)">Yes</button>
                <button @click="showDeleteCommentModal = null">No</button>
                </div>
              </div>
            </div>
            
          </div>

          <div v-if="isLoggedIn" class="comment-input">
            <input v-model="newComment" placeholder="Write a comment..." />
            <button @click="submitComment">Post</button>
          </div>
          <p v-else style="color: gray;">
            You must be logged in to post comments.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const starFull = new URL('../assets/star.png', import.meta.url).href;
const starEmpty = new URL('../assets/star-empty.png', import.meta.url).href;
const starAvgFull = new URL('../assets/star-avg.png', import.meta.url).href;
const heartIcon = new URL('../assets/heart_icon.png', import.meta.url).href;
const brokenHeartIcon = new URL('../assets/broken_hrt_icon.png', import.meta.url).href;
const commentIcon = new URL('../assets/comment_icon.png', import.meta.url).href;

export default {
  name: 'ReviewPost',
  props: {
    review: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      newComment: '',
      showComments: false,
      isLoggedIn: false,
      currentUsername: '',
      userLiked: false,
      userDisliked: false,
      loading: false,
      isHoveringReview: false,
      hoveredCommentId: null,
      showDeleteModal: false,
      showDeleteCommentModal: null,
      userRole: '',
      auth: null
    };
  },
   computed: {
    averageRating() {
      return Number(this.review.average_rating) || 0;
    },
    avgStars() {
      return Math.round(this.averageRating);
    },
    starFull() {
      return starFull;
    },
    starEmpty() {
      return starEmpty;
    },
    starAvgFull() {
      return starAvgFull;
    },
    heartIcon() {
      return heartIcon;
    },
    brokenHeartIcon() {
      return brokenHeartIcon;
    },
    commentIcon() {
      return commentIcon;
    },
    // Check if current user can delete this review
    canDeleteReview() {
      if (!this.isLoggedIn) return false;
      return this.currentUsername === this.review.username || this.userRole === 'admin';
    }
  },
  methods: {
    getProfilePictureUrl(filename) {
      if (!filename) return new URL('../assets/defaultpfp.jpg', import.meta.url).href;
      return new URL(`../assets/user_pfp/${filename}`, import.meta.url).href;
    },
    getEpisodePictureUrl(url) {
      return url || new URL('../assets/series_images/basic_series.png', import.meta.url).href;
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatSeasonEpisode(review) {
      const season = (review.season_number || 0).toString().padStart(2, '0');
      const episode = (review.episode_number || 0).toString().padStart(2, '0');
      return `${season}x${episode}`;
    },

    async likeReview() {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth?.loggedIn) return;

      try {
        const res = await fetch(`/api/reviews/${this.review.id}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ is_like: true })
        });

        if (res.ok) {
          const data = await res.json();
          this.review.likes = data.likes;
          this.review.dislikes = data.dislikes;
          this.userLiked = data.reaction === 'like';
          this.userDisliked = data.reaction === 'dislike';
        }
      } catch (e) {
        console.error('Error liking review:', e);
      }
    },

    async dislikeReview() {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth?.loggedIn) return;

      try {
        const res = await fetch(`/api/reviews/${this.review.id}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ is_like: false })
        });

        if (res.ok) {
          const data = await res.json();
          this.review.likes = data.likes;
          this.review.dislikes = data.dislikes;
          this.userLiked = data.reaction === 'like';
          this.userDisliked = data.reaction === 'dislike';
        }
      } catch (e) {
        console.error('Error disliking review:', e);
      }
    },
    // Check if current user can delete a comment
    canDeleteComment(comment) {
      if (!this.isLoggedIn) return false;
      return this.currentUsername === comment.username || this.userRole === 'admin';
    },
    
    async confirmDeleteReview() {
      try {
        const res = await fetch(`/api/reviews/${this.review.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.auth.user.id.toString()
          }
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete review');
        }

        this.$emit('review-deleted', this.review.id);
        this.showDeleteModal = false;
      } catch (e) {
        console.error('Error deleting review:', e);
        alert(e.message || 'An error occurred while deleting the review');
      }
    },

    async confirmDeleteComment(commentId) {
      try {
        const res = await fetch(`/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.auth.user.id.toString()
          }
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete comment');
        }

        this.comments = this.comments.filter(c => c.id !== commentId);
        this.review.comment_count = Math.max(0, (this.review.comment_count || 0) - 1);
        this.showDeleteCommentModal = null;
      } catch (e) {
        console.error('Error deleting comment:', e);
        alert(e.message || 'An error occurred while deleting the comment');
      }
    },

    checkLoginStatus() {
      this.auth = JSON.parse(localStorage.getItem('auth'));
      if (this.auth && this.auth.loggedIn) {
        this.isLoggedIn = true;
        this.currentUsername = this.auth.user.username;
        this.userRole = this.auth.user.role || ''; 
      } else {
        this.isLoggedIn = false;
        this.currentUsername = '';
        this.userRole = '';
      }
    },

    async toggleComments() {
      this.showComments = !this.showComments;
      if (this.showComments && this.comments.length === 0) {
        await this.fetchComments();
      }
    },

    async fetchComments() {
      this.loading = true;
      try {
        const res = await fetch(`/api/reviews/${this.review.id}/comments`);
        if (res.ok) {
          this.comments = await res.json();
        }
      } catch (e) {
        console.error('Error loading comments:', e);
      } finally {
        this.loading = false;
      }
    },

    async submitComment() {
      const text = this.newComment.trim();
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!text || !this.isLoggedIn || !auth || !auth.loggedIn) return;

      try {
        const bodyData = {
          comment_text: text,
          episode_id: this.review.episode_id || 0,
          other_user_id: null
        };

        const res = await fetch(`/api/reviews/${this.review.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify(bodyData)
        });

        if (res.ok) {
          await this.fetchComments();
          this.newComment = '';
          this.review.comment_count = (this.review.comment_count || 0) + 1;
        }
      } catch (e) {
        console.error('Error posting comment:', e);
      }
    }
  },

  mounted() {
    this.loading = true;
    this.checkLoginStatus();

  }
};
</script>




<style scoped>
/* Layout & Container Styles */
.review-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.review-box {
  max-width: 100%;
  table-layout: auto;
}

.review-container {
  display: flex;
  position: relative;
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, rgba(112, 233, 116, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(112, 233, 116, 0.2);
  color: var(--text-color);
  max-height: 600px;
  margin: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.review-container:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(112, 233, 116, 0.2);
  border-color: rgba(112, 233, 116, 0.4);
}

.review-container.no-bottom-padding {
  margin-bottom: 0;
}

/* Series Section */
.series-section {
  background: linear-gradient(180deg, rgba(18, 20, 20, 0.8) 0%, var(--section-dark-color) 100%);
  max-width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-right: 1px solid rgba(112, 233, 116, 0.15);
  position: relative;
}

.series-image-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.series-image-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(112, 233, 116, 0.3) 0%, transparent 100%);
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.review-container:hover .series-image-wrapper::after {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  border-radius: 8px;
  pointer-events: none;
}

.square-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.review-container:hover .square-img {
  transform: scale(1.05);
}

.series-title {
  font-size: 20px;
  font-weight: 700;
  margin: 12px 0 8px 0;
  padding: 0 10px;
  text-align: center;
  color: var(--accent-color);
  line-height: 1.3;
}

.season-episode {
  font-size: 14px;
  color: var(--subtitle-color);
  margin: 5px 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avg-rating-card {
  background: rgba(112, 233, 116, 0.1);
  border: 1px solid rgba(112, 233, 116, 0.3);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  width: 100%;
  margin-top: auto;
}

.avg-label {
  font-size: 12px;
  color: var(--subtitle-color);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.avg-score {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-color);
  margin: 0 0 10px 0;
}

.avg-score span {
  font-size: 18px;
  opacity: 0.8;
}

/* Right Container */
.right-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
  max-height: 600px;
  gap: 15px;
}

/* Top Section - User Info */
.top-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  position: relative;
}

.user-rating-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pfp {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(112, 233, 116, 0.3);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.user-info:hover .pfp {
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  transition: color 0.2s ease;
}

.user-info:hover .username {
  color: var(--accent-color);
}

.user-reviews {
  font-size: 13px;
  color: var(--subtitle-color);
  margin: 0;
}

.user-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-size: 12px;
  color: var(--subtitle-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star {
  width: 28px;
  height: 28px;
  transition: transform 0.2s ease;
}

.star-avg {
  width: 24px;
  height: 24px;
}

.rating {
  display: flex;
  justify-content: center;
  gap: 4px;
}

/* Delete Button */
.review-delete-button {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 100, 100, 0.9);
  border: none;
  border-radius: 0 16px 0 8px;
  padding: 8px 12px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-8px) scale(0.9);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-container:hover .review-delete-button,
.review-delete-button:focus-within {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.delete-icon {
  width: 24px;
  height: 24px;
}

/* Content Section */
.content-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.episode-title {
  font-size: 14px;
  color: var(--subtitle-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  font-weight: 600;
}

.review-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  line-height: 1.3;
}

.review-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--subtitle-color);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Bottom Section - Actions */
.bottom-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(112, 233, 116, 0.1);
}

.date-container {
  display: flex;
  align-items: center;
}

.date {
  margin: 0;
  font-size: 13px;
  color: var(--subtitle-color);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(112, 233, 116, 0.1);
  border: 1px solid rgba(112, 233, 116, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color);
}

.action-btn:hover {
  background: rgba(112, 233, 116, 0.2);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.action-btn:active {
  transform: scale(0.95);
}

.like-btn {
  color: rgb(255, 100, 100);
  border-color: rgba(255, 100, 100, 0.3);
  background: rgba(255, 100, 100, 0.05);
}

.like-btn:hover {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgb(255, 100, 100);
  color: rgb(255, 100, 100);
}

.dislike-btn {
  color: rgb(255, 100, 100);
  border-color: rgba(255, 100, 100, 0.3);
  background: rgba(255, 100, 100, 0.05);
}

.dislike-btn:hover {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgb(255, 100, 100);
}

.small-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.action-btn:hover .small-icon {
  transform: scale(1.15);
}

.count {
  font-size: 14px;
  font-weight: 600;
  min-width: 20px;
}

/* Comments Section */
.comment-section {
  background: linear-gradient(180deg, rgba(30, 28, 39, 0.8) 0%, rgba(112, 233, 116, 0.05) 100%);
  border-top: 2px solid rgba(112, 233, 116, 0.2);
  padding: 25px;
  box-sizing: border-box;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 0 0 16px 16px;
}

.loading-text {
  color: var(--subtitle-color);
  font-style: italic;
}

.center-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  gap: 15px;
}

.comment {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  background: rgba(112, 233, 116, 0.08);
  padding: 15px;
  border-radius: 10px;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid rgba(112, 233, 116, 0.15);
  transition: all 0.2s ease;
}

.comment:hover {
  background: rgba(112, 233, 116, 0.12);
  border-color: rgba(112, 233, 116, 0.3);
}

.comment p {
  margin: 0;
  flex: 1;
  line-height: 1.5;
  font-size: 14px;
  color: var(--text-color);
}

.comment-pfp-wrapper {
  position: relative;
  display: flex;
  justify-content: left;
  align-items: center;
  min-width: 40px;
  width: auto;
  flex-shrink: 0;
}

.comment-pfp {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid rgba(112, 233, 116, 0.3);
  transition: all 0.2s ease;
}

.comment:hover .comment-pfp {
  border-color: var(--accent-color);
}

.op-star,
.admin-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.admin-user {
  color: rgb(153, 153, 153);
  font-weight: 600;
}

.op-user {
  color: var(--accent-color);
  font-weight: 600;
}

.admin-label {
  font-weight: 600;
  color: rgb(153, 153, 153);
  font-size: 12px;
  margin-left: 4px;
}

.delete-comment-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 30px;
  margin-left: auto;
}

.delete-comment-button {
  background: rgba(255, 100, 100, 0.8);
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.comment:hover .delete-comment-button {
  opacity: 1;
  transform: scale(1);
}

.delete-comment-button:hover {
  background: rgba(255, 100, 100, 1);
}

/* Comment Input */
.comment-input {
  display: flex;
  width: 100%;
  max-width: 700px;
  box-sizing: border-box;
  gap: 10px;
  margin-top: 15px;
}

.comment-input input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(112, 233, 116, 0.08);
  color: var(--text-color);
  border: 1px solid rgba(112, 233, 116, 0.3);
  font-size: 14px;
  transition: all 0.2s ease;
}

.comment-input input:focus {
  outline: none;
  background: rgba(112, 233, 116, 0.15);
  border-color: var(--accent-color);
  box-shadow: 0 0 8px rgba(112, 233, 116, 0.2);
}

.comment-input input::placeholder {
  color: var(--subtitle-color);
}

.comment-input button {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--accent-color), rgba(112, 233, 116, 0.8));
  color: var(--dark-bg-color);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 14px;
}

.comment-input button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(112, 233, 116, 0.3);
}

.comment-input button:active {
  transform: translateY(0);
}

/* Delete Modal */
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.delete-modal-content {
  background: linear-gradient(135deg, var(--dark-bg-color) 0%, rgba(112, 233, 116, 0.05) 100%);
  border: 1px solid rgba(112, 233, 116, 0.2);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  width: auto;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delete-modal-content p {
  margin: 0;
  color: var(--text-color);
  font-size: 16px;
}

.delete-modal-content hr {
  margin: 15px 0;
  border: none;
  border-top: 1px solid rgba(112, 233, 116, 0.2);
}

.delete-modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.delete-modal-buttons button {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.delete-modal-buttons button:first-child {
  background: rgb(255, 100, 100);
  color: white;
}

.delete-modal-buttons button:first-child:hover {
  background: rgb(255, 70, 70);
  transform: translateY(-2px);
}

.delete-modal-buttons button:last-child {
  background: rgba(112, 233, 116, 0.2);
  color: var(--text-color);
  border: 1px solid rgba(112, 233, 116, 0.3);
}

.delete-modal-buttons button:last-child:hover {
  background: rgba(112, 233, 116, 0.3);
  border-color: var(--accent-color);
}

/* Button Resets */
button {
  cursor: pointer;
  background-color: transparent;
  border: none;
}

/* Media Queries */
@media (max-width: 900px) {
  .review-container {
    flex-direction: column;
    max-height: fit-content;
  }

  .series-section {
    max-width: unset;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(112, 233, 116, 0.15);
    min-width: unset;
  }

  .top-section {
    flex-direction: column;
    gap: 20px;
  }

  .user-rating-section {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .user-rating {
    width: 100%;
    align-items: flex-start;
  }
}

@media (max-width: 500px) {
  .series-section {
    padding: 15px;
  }

  .square-img {
    width: 160px;
    height: 160px;
  }

  .series-title {
    font-size: 18px;
  }

  .review-title {
    font-size: 18px;
  }

  .right-container {
    padding: 15px;
    gap: 12px;
  }

  .content-section {
    gap: 10px;
  }

  .review-text {
    -webkit-line-clamp: 2;
    line-clamp: 2;
    font-size: 14px;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-around;
    margin-left: 0;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .bottom-section {
    flex-direction: column;
    gap: 12px;
    padding-top: 12px;
  }

  .date-container {
    width: 100%;
    justify-content: center;
  }

  .comment {
    padding: 12px;
  }

  .comment p {
    min-width: unset;
    font-size: 13px;
  }

  .delete-modal-content {
    margin: 20px;
    padding: 20px;
  }

  .delete-modal-content p {
    min-width: unset;
  }
}

@media (hover: none) {
  .review-container:hover {
    transform: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .review-container:hover .square-img {
    transform: none;
  }

  .review-delete-button {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  .delete-comment-button {
    opacity: 1;
    transform: scale(1);
  }
}
</style>