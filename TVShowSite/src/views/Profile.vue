<template>
    <div id="app">
        <div class="profile-container">
            <div class="profile-header">
            <div class="profile-info">
                <img class="profile-icon" :src="user.profile_picture || defaultIcon" alt="Profile Icon" />
                <div class="user-details">
                <h2 class="username">{{ user.username }}</h2>
                <p class="review-count">{{ reviewCount }} reviews</p>
                </div>
            </div>
            <button class="logout-btn" @click="logout">Logout</button>
            </div>
            <div class="reviews-list" v-if="reviews.length > 0">
                <h2 id="center">User Reviews</h2>
                <div id="center">
                    <ul>
                        <li v-for="review in reviews" :key="review.id" class="review-item">
                        <strong>{{ review.episode_title }}</strong> ({{ review.rating }}/5):<br> {{ review.review_title }}
                        </li>
                    </ul>
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
      defaultIcon: "/src/assets/user_pfp/defaultpfp.jpg"
    };
  },
  mounted() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth || !auth.loggedIn) {
      this.$router.push('/login');
      return;
    }
    this.user = auth.user;
    this.fetchUserReviews(this.user.id);
  },
  methods: {
    async fetchUserReviews(userId) {
      try {
        const res = await fetch(`http://localhost:3000/api/reviews?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        this.reviews = await res.json();
        this.reviewCount = this.reviews.length;
      } catch (error) {
        console.error(error);
      }
    },
    logout() {
      localStorage.removeItem('auth');
      this.$router.push('/login');
      location.reload(); // force refresh so that login buttons refresh
    },
    new_review() {
        this.$router.push('/create-review');
    }
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
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 10px 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: small;
  cursor: pointer;
  height: fit-content;
}

.logout-btn:hover {
  background-color: #e74c3c;
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
</style>
