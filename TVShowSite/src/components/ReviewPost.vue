<template>
  <div class="review-wrapper">
    <div class="review-container">
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
            :src="n <= avgStars ? './src/assets/star.png' : './src/assets/star-empty.png'"
            alt="average show star rating"
          />
        </div>
      </div>

      <div class="right-container">
        <div class="top-section">
          <h2 class="series-title">{{ review.episode_title || 'Episode Title' }}</h2>
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
              <h2>{{ review.username || 'username' }}</h2>
              <h3>{{ review.user_review_count || 0 }} reviews</h3>
            </div>
            <img
              class="pfp"
              :src="getProfilePictureUrl(review.profile_picture)"
              alt="User profile picture"
            />
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
          <p class="likes">{{ likes }}</p>

          <button @click="dislikeReview"><img class="small-icon" :src="'./src/assets/broken_hrt_icon.png'" alt="dislikes" /></button>
          <p class="dislikes">{{ dislikes }}</p>

          <button @click="toggleComments">
            <img class="small-icon" :src="'./src/assets/comment_icon.png'"  alt="comments" />
          </button>
          <p class="comments">{{ comments.length }}</p>
            
        </div>
      </div>
    </div>
    <div v-if="showComments" class="comment-section">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <strong>{{ comment.username }}:</strong> {{ comment.text }}
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
      likes: this.review.likes,
      dislikes: this.review.dislikes,
      comments: [],
      newComment: '',
      showComments: false,
      isLoggedIn: false,
      currentUsername: ''
    };
  },
  computed: {
    averageRating() {
      return Number(this.review.average_rating) || 0;
    },
    avgStars() {
      return Math.round(this.averageRating);
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
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth || !auth.loggedIn) return;

        // Prevent multiple likes by the same user
        if (this.userLiked) {
          console.log('Already liked');
          return;
        }

        const res = await fetch(`/api/reviews/${this.review.id}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString(),
          },
          body: JSON.stringify({ is_like: true }),
        });

        const data = await (res.headers.get('content-type')?.includes('application/json') ? res.json() : null);

        if (res.ok) {
          // Update counts from backend response if available, else update locally
          this.likes = data.likes !== undefined ? data.likes : this.likes + 1;
          this.dislikes = data.dislikes !== undefined ? data.dislikes : (this.dislikes > 0 ? this.dislikes - 1 : 0);

          this.userLiked = true;
          this.userDisliked = false;
        } else {
          console.warn(data?.message || 'Failed to like');
        }
      } catch (e) {
        console.error('Error liking review:', e);
      }
    },
    async dislikeReview() {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth || !auth.loggedIn) return;

        // Prevent multiple dislikes by same user
        if (this.userDisliked) {
          console.log('Already disliked');
          return;
        }

        const res = await fetch(`/api/reviews/${this.review.id}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString(),
          },
          body: JSON.stringify({ is_like: false }),
        });

        const data = await (res.headers.get('content-type')?.includes('application/json') ? res.json() : null);

        if (res.ok) {
          this.dislikes = data.likes !== undefined ? data.dislikes : this.dislikes + 1; 
          this.likes = data.likes !== undefined ? data.likes : this.likes > 0 ? this.likes - 1 : 0;

          this.userDisliked = true;
          this.userLiked = false;
        } else {
          console.warn(data?.message || 'Failed to dislike');
        }
      } catch (e) {
        console.error('Error disliking review:', e);
      }
    },
    checkLoginStatus() {
      const auth = JSON.parse(localStorage.getItem('auth'));

      if (auth && auth.loggedIn) {
        this.isLoggedIn = true;
        this.currentUsername = auth.user.username;
      } else {
        this.isLoggedIn = false;
        this.currentUsername = '';
      }
    },

    async toggleComments() {
      this.showComments = !this.showComments;
      if (this.showComments && this.comments.length === 0) {
        await this.fetchComments();
      }
    },
    async fetchComments() {
      try {
        const res = await fetch(`/api/reviews/${this.review.id}/comments`);
        if (res.ok) {
          this.comments = await res.json();
        }
      } catch (e) {
        console.error('Error loading comments:', e);
      }
    },
    async submitComment() {
      const text = this.newComment.trim();
      const auth = JSON.parse(localStorage.getItem('auth'));

      if (!text || !this.isLoggedIn) return;
      
      if (!auth || !auth.loggedIn) {
        return;
      }

      try {
        const res = await fetch(`/api/reviews/${this.review.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization':auth.user.id.toString()
          },
          body: JSON.stringify({ comment_text: text })
        });

        if (res.ok) {
          this.comments.push({
            id: Date.now(),
            username: this.currentUsername || 'You',
            comment_text: text,
            created_at: new Date().toISOString()
          });
          this.newComment = '';
        } else {
          const msg = await res.json();
          console.warn(msg.message);
        }
      } catch (e) {
        console.error('Error posting comment:', e);
      }
    }


  },
  mounted() {
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
    margin-right: 10%;
    margin-bottom: 20px;
    box-sizing: border-box;
    align-self: center;
    overflow: auto;
    text-overflow: ellipsis;
    max-width: 1000px;
}
.content-section p{
    font-size: 22px;
}
.bottom-section{
    display: flex;
    align-items: flex-end;
    justify-content: right;
    flex:1;
}
.bottom-section p{
    min-width: 0;
    width: 10%;
}
.date-container{
    display: flex;
    justify-content: left;
}
.date-container p {
    width: 20%;
}
.series-section{
    max-width: 300px;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.series-section p,h1{
    min-width: 0;
    padding: 0;
}
.right-container{
    display: flex;
    flex-direction: column;
    max-height: 700px;
}
.review-container{
    display: flex;
    
    background-color: var(--dark-bg-color);
    border-radius: 8px;
    color:var(--text-color);
    max-height: 600px;
    max-width: fit-content;
    padding-top: 10px;
    padding-bottom: 10px;
    width: auto;
    margin: auto;
    margin-top: 20px;
    margin-bottom: 50px;
}
.comment-section {
  margin-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
}
.comment {
  background-color: #333;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 5px;
}
.comment-input {
  display: flex;
  margin-top: 10px;
}
.comment-input input {
  flex: 1;
  padding: 8px;
  margin-right: 10px;
}
.comment-input button {
  padding: 8px 12px;
}

</style>