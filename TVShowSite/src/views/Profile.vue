<template>
  <div id="app">
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-info">
          <div class="pfp-wrapper">
            <img class="profile-icon" :src="user.profile_picture || defaultIcon" alt="Profile Icon" />
            <img v-if="user.role === 'admin'" src="../assets/admin_gear.png" alt="admin icon" class="admin-icon"/>
          </div>
          <div class="user-details">
            <h2 class="username" v-if="!isEditingUsername">
              {{ user.username }}<span v-if="user.role==='admin'" class="admin-label"> (ADMIN)</span>
            </h2>
            <div v-else>
              <input v-model="newUsername" />
              <button class="save-btn" @click="saveUsername">Save</button>
              <button class="cancel-btn" @click="isEditingUsername=false">Cancel</button>
            </div>
            <p class="review-count">{{ reviewCount }} reviews</p>
          </div>
        </div>
        <button class="edit-btn" @click="edit"><img src="../assets/edit.png"></button>
        <button class="logout-btn" @click="logout"><img src="../assets/logout.png"></button>
      </div>

      <div class="reviews-list" v-if="reviews.length">
        <h2 class="center">User Reviews</h2>
        <div class="reviews-grid">
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <img v-if="review.episode_image" :src="review.episode_image" alt="Episode Still" class="episode-still"/>
            <div class="review-info">
              <strong class="episode-title">{{ review.episode_title }}</strong>
              <span class="series-info">{{ review.series_title }} | S{{ review.season_number }}E{{ review.episode_number }}</span>
              <p :class="['rating-text', `rating-${review.rating}`]">
                Rating: {{ review.rating }}/5
              </p>
              <p class="review-text"><b>{{ review.review_title }}</b>: {{ review.review_text }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <p>No reviews yet.</p>
      </div>

      <div class="center">
        <button class="new-review-btn" @click="new_review">NEW REVIEW</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {},
      reviews: [],
      reviewCount: 0,
      defaultIcon: "/src/assets/user_pfp/defaultpfp.jpg",
      newUsername: '',
      isEditingUsername: false
    };
  },
  mounted() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth?.loggedIn) {
      this.$router.push('/login');
      return;
    }
    this.user = auth.user;
    this.fetchUserReviews(this.user.id);
  },
  methods: {
    edit() {
      this.newUsername = this.user.username;
      this.isEditingUsername = true;
    },
    async saveUsername() {
      if (!this.newUsername.trim()) return alert('Username cannot be empty');
      if (this.newUsername === this.user.username) return this.isEditingUsername = false;

      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.user.id}/username`, {
          method: 'PUT',
          headers: {
            'Content-Type':'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ newUsername: this.newUsername })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update username');
        this.user.username = data.user.username;
        this.isEditingUsername = false;
        localStorage.setItem('auth', JSON.stringify({ loggedIn: true, user: this.user }));
        alert('Username updated successfully');
      } catch(err) { alert(err.message || 'Error updating username'); }
    },
    async fetchUserReviews(userId) {
      try {
        const res = await fetch(`/api/user-reviews/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        this.reviews = await res.json();
        this.reviewCount = this.reviews.length;
      } catch (error) {
        console.error('Failed to fetch user reviews:', error);
      }
    },
    logout() {
      localStorage.removeItem('auth');
      this.$router.push('/login');
      location.reload();
    },
    new_review() { this.$router.push('/create-review'); }
  }
};
</script>
<style scoped>
.profile-container {
  max-width: 800px;
  margin: 30px auto 30px auto;
  padding: 40px 20px;
  background: var(--dark-bg-color);
  color: var(--text-color);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 15px;
}

.profile-info {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.profile-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
#center{
    display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
ul{
    display: inline-block;
    text-align: left;
    list-style-type: square;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 28px;
  font-weight: bold;
}

.review-count {
    text-align: left;
    font-size: 16px;
    color: var(--subtitle-color);
}

.logout-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  justify-content: center;
  width: 65px;
  height: auto;
}
.logout-btn img{
  width: 38px;
  height: auto;
}

.edit-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  justify-content: center;
  width: 65px;
  height: auto;
}
.edit-btn img{
  width: 34px;
  height: auto;
}

.new-review-btn {
  background-color: #2fa071;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 6px;
  font-weight: bold;
  font-size: large;
  cursor: pointer;
  height: fit-content;
}

.new-review-btn:hover {
  background-color: #38bb89;
}
.reviews-list{
    padding-top: 10px;
    padding-bottom: 10px;
}
.reviews-list h3 {
  margin-bottom: 15px;
}

.review-item {
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 1.3;
}


.episode-meta {
  margin: 0 0 4px 0;
}


.reviews-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rating-text {
  font-weight: bold;
  font-size: 1rem;
  text-shadow: 0 0 2px rgba(0,0,0,0.5); /* subtle base glow */
  transition: all 0.3s ease;
}

/* Colors and glow per rating */
.rating-1 { color: #ff4c4c; text-shadow: 0 0 8px #ff4c4c; }      /* red */
.rating-2 { color: #ff884c; text-shadow: 0 0 8px #ff884c; }      /* orange */
.rating-3 { color: #ffd93d; text-shadow: 0 0 8px #ffd93d; }      /* yellow */
.rating-4 { color: #a6e22e; text-shadow: 0 0 8px #a6e22e; }      /* light green */
.rating-5 { color: #38c172; text-shadow: 0 0 12px #38c172; }     /* green */

/* hover effect for fun */
.rating-text:hover {
  transform: scale(1.1);
  text-shadow: 0 0 4px currentColor, 0 0 20px currentColor;
}

.review-card {
  display: flex;
  gap: 12px;
  background: var(--dark-bg-color);
  padding: 10px;
  border-radius: 8px;
  align-items: flex-start;
}

.episode-still {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.review-info {
  display: flex;
  flex-direction: column;
}

.episode-title { font-weight: 600; margin-bottom: 2px; }
.series-info { font-size: 0.85rem; color: var(--subtitle-color); }
.review-text { margin-top: 4px; font-size: 0.9rem; }
.pfp-wrapper {
  position: relative;
  display: flex;
  justify-content: left;
  align-items: center;
  min-width: 45px;
  width: auto;
  margin-right: 20px;
}
.admin-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 45px;
  height: 45px;
  pointer-events: none;
  transform: translate(60%, -35%);
}
.admin-label {
  color: gray;
  font-weight: normal;
}
.user-details input {
  font-size: 16px;
  padding: 5px;
  margin-right: 5px;
}
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.review-card {
  background: var(--dark-bg-color);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.episode-still {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}

.review-info {
  text-align: center;
}

.episode-title {
  font-size: 1rem;
  margin-bottom: 4px;
  font-weight: 600;
}

.review-text {
  font-size: 0.9rem;
  margin-top: 2px;
}
.cancel-btn {
  background-color: var(--light-bg-color);
  color: var(--text-color);
  border-radius: 8px;
  margin-left:10px;
  padding: 8px 14px;
  font-size: 16px;
  cursor: pointer;
}
.save-btn {
  border-radius: 8px;
  margin-left:10px;
  padding: 8px 14px;
  font-size: 16px;
  cursor: pointer;
  background-color: #2fa071;
  color: white;
}
@media (max-width: 500px) {
  .profile-container{
    padding-left: 0;
    padding-right: 0;
  }
  .logout-btn{
    margin: 0;
    height: 0;
  }
  .profile-icon{
    width: 60px;
    height: 60px;
  }
  .username{
    font-size: 20px;
  }
  .edit-btn img, .logout-btn img{
    width:40px;
    height:auto;
  }
}
</style>
