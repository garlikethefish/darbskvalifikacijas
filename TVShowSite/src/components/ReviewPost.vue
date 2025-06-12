<template>
  <div class="review-wrapper">
    <div class="review-box" >
      <div class="review-container" :class="{ 'no-bottom-padding': showComments }" @mouseenter="isHoveringReview = true" 
     @mouseleave="isHoveringReview = false">
        
        <div class="series-section">
          <h1 class="series-title">{{ review.series_title || 'Series Title' }}</h1>
          <img class="square-img" :src="getEpisodePictureUrl(review.episode_picture)" alt="Episode image" />
          <h2 class="season-episode">{{ formatSeasonEpisode(review) }}</h2>
          <p class="avg">Average score: {{ Number(review.average_rating).toFixed(2) }} / 5</p>
          <div class="rating">
            <img
              v-for="n in 5"
              :key="n"
              class="star-avg"
              :src="n <= avgStars ? './src/assets/star-avg.png' : './src/assets/star-empty.png'"
              alt="average show star rating"
            />
          </div>
        </div>

        <div class="right-container">
          <div class="top-section">
            <h2 class="episode-title">{{ review.episode_title || 'Episode Title' }}</h2>
            <div class="rating">
              <img
                v-for="n in 5"
                :key="'user-star-' + n"
                class="star"
                :src="n <= review.rating ? './src/assets/star.png' : './src/assets/star-empty.png'"
                alt="user rating star"
              />
            </div>

            <div class="user-container">
              <div class="user">
                <h2 >{{ review.username || 'username' }}</h2>
                <h3>{{ review.user_review_count || 0 }} reviews</h3>
              </div>
              <img
                class="pfp"
                :src="getProfilePictureUrl(review.profile_picture)"
                alt="User profile picture"
              />
            </div>
            <button 
              v-if="(isHoveringReview && canDeleteReview) || showDeleteModal"
              class="review-delete-button"
              @click.stop="showDeleteModal = true" >
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
            <h1>{{ review.review_title }}</h1>
            <p>{{ review.review_text }}</p>
          </div>

          <div class="bottom-section">
            <div class="date-container">
              <p class="date">{{ formatDate(review.date) }}</p>
            </div>

            <button @click="likeReview"><img class="small-icon" :src="'./src/assets/heart_icon.png'" alt="likes" /></button>
            <p class="likes">{{ review.likes }}</p>

            <button @click="dislikeReview"><img class="small-icon" :src="'./src/assets/broken_hrt_icon.png'" alt="dislikes" /></button>
            <p class="dislikes">{{ review.dislikes }}</p>

            <button @click="toggleComments">
              <img class="small-icon" id="comment-icon" :src="'./src/assets/comment_icon.png'"  alt="comments" />
            </button>
            <p class="comments">{{ review.comment_count }}</p>
              
          </div>
        </div>
      </div>
      <div v-if="showComments" class="comment-section">
        <p v-if="loading" class="loading-text">Loading comments...</p>

        <div v-else>
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
    getEpisodePictureUrl(filename) {
      if (!filename) return new URL('../assets/series_images/basic_series.png', import.meta.url).href;
      return new URL(`../assets/series_season_images/${filename}`, import.meta.url).href;
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




<style>
.pfp{
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    margin: 10px;
    margin-right: 40px;
}
.small-icon{
    width: 60px;
    height: 60px;
    margin: 10px;
}
button {
  background-color: transparent;
  border: none;
}
.square-img{
    width: 200px;
    height: 200px;
    
    
}
.star{
    max-width: 50px;
    height: auto;
}
.episode-title{
  text-overflow:ellipsis;
  white-space: nowrap;
}
.star-avg{
    max-width: 30px;
    height: auto;
}
.rating{
    display: flex;
    justify-content: center; 

}
.top-section{
    display: flex;
    align-items: center;
    text-align: center;
    padding:15px;
    gap: clamp(10px, 1vw, 40px);
}
.user{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin:5px;
    width: auto;
}
.user h3, h2{
  margin: 2px;
}
.user-container{
    display: flex;
    align-items: center;
    justify-content: right;
    flex-direction: row;
}
.content-section{
    display: flex;
    flex-direction: column;
    min-height: 100px;
    margin-bottom: 20px;
    box-sizing: border-box;
    align-self: center;
    overflow: auto;
    text-overflow: ellipsis;
    max-width: 1000px;
}
.content-section p{
    font-size: 18px;
}
.bottom-section{
    display: flex;
    align-items: flex-end;
    justify-content: right;
    flex:1;
}
.bottom-section p{
    min-width: 0;
    width: 3%;
    margin-bottom: 30px;
    font-size: large;
}
.date-container{
    display: flex;
    justify-content: left;
}
.date-container p {
    width: auto;
}
.series-section{
    background: linear-gradient(90deg,var(--dark-bg-color)0%, var(--section-dark-color) 100%);;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
}
.series-section p,h1{
    min-width: 0;
    padding: 0;
}
.right-container{
    display: flex;
    flex-direction: column;
    max-height: 700px;
    margin: 15px;
    margin-right: 30px;
}
.review-wrapper {
  display: flex;
  justify-content: center;
}

.review-box {
  width: fit-content;
  max-width: 100%;
}

.review-container{
    display: flex;
    
    background-color: var(--dark-bg-color);
    border-radius: 8px;
    color:var(--text-color);
    max-height: 600px;
    max-width: fit-content;
    margin: auto;
    margin-top: 20px;
    margin-bottom: 50px;
    width: 100%;
    box-sizing: border-box;
}
.review-container.no-bottom-padding {
  margin-bottom: 0;
}
.comment-section {
  background: linear-gradient(180deg, var(--dark-bg-color) 33%, var(--background-color) 100%);
  padding: 20px;
  box-sizing: border-box;
  margin: 40px auto; 
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.comment p {
  text-align: left;
}
.comment {
  display: flex;
  max-width: 600px;
  box-sizing: border-box;
  background-color: var(--dark-bg-color);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  align-items: center;
  gap: 12px;
}
.comment p{
  min-width: 400px; 
}
.comment-pfp {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.comment-input {
  display: flex;
  max-width: 600px;
  box-sizing: border-box;
}
.comment-input input {
  flex: 1;
  padding: 8px;
  margin-right: 10px;
}
.comment-input button {
  padding: 8px 12px;
  background-color: aquamarine;
}


.comment-pfp-wrapper {
  position: relative;
  display: flex;
  justify-content: left;
  align-items: center;
  min-width: 45px;
  width: auto;
}

.op-star {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  pointer-events: none;
  transform: translate(30%, -30%);
}

.admin-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  pointer-events: none;
  transform: translate(30%, -30%);
}

.delete-review-container {
  right: 0;
  top: 0;
  height: 100%;
  min-width: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10px;
}

.delete-comment-container {
  right: 0;
  top: 0;
  height: 100%;
  min-width: 30px;
  display: flex;
  justify-content: right;
}
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
}

.delete-comment-button {
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
}

.delete-icon {
  width: 40px;
  height: 40px;
}

.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 5px;
}

.delete-modal-content {
  background-color: var(--dark-bg-color);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: auto;
}
.delete-modal-content p{
  display: block;
  text-align: center;
  font-size: large;
  min-width: 400px;
}

.delete-modal-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}
.delete-modal-buttons button{
  background-color: var(--background-color);
  border-radius: 20px;
  color: var(--text-color);
  font-size: large;
}

.delete-modal-buttons button {
  padding: 5px 15px;
  cursor: pointer;
}
button {cursor: pointer;}

[data-theme="dark"] #comment-icon {
  content: url('../assets/comment_icon.png'); 
}

[data-theme="light"] #comment-icon {
  content: url('../assets/comment_icon-dark.png');
}
.admin-user {
  color: rgb(153, 153, 153);
}
.op-user {
  color: rgb(62, 221, 128);
}
.admin-label {
  font-weight: normal;
  color: rgb(153, 153, 153);
}
@media (max-width: 500px) {
  .review-container{
    flex-direction: column;
    max-height: fit-content;
  }
  .top-section{
    flex-direction: column;
    padding: 0;
  }
  .series-section{
    padding:0;
    max-width: unset;
  }
  .comment p{
    min-width: unset;
  }
}

</style>