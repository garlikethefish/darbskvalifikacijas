<template>
    <div id="app">
        <div class="profile-container">
            <div class="profile-header">
            <div class="profile-info">
              <div class="pfp-wrapper">
                <img class="profile-icon" :src="user.profile_picture || defaultIcon" alt="Profile Icon" />
                <img
                v-if="user.role === 'admin'"
                  src="../assets/admin_gear.png"
                  alt="admin icon"
                  class="admin-icon"/>
              </div>
                <div class="user-details">
                  <h2 class="username" v-if="!isEditingUsername">{{ user.username }}<span v-if="user.role === 'admin'" class="admin-label"> (ADMIN)</span>
                  </h2>
                  <div v-else>
                    <input v-model="newUsername" />
                    <button class="save-btn" @click="saveUsername">Save</button>
                    <button class="cancel-btn" @click="isEditingUsername = false">Cancel</button>
                  </div>
                  <p class="review-count">{{ reviewCount }} reviews</p>
                </div>
            </div>
            <button class="edit-btn"@click="edit"><img src="../assets/edit.png"><img></button>
            <button class="logout-btn"@click="logout"><img src="../assets/logout.png"><img></button>
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
      defaultIcon: "/src/assets/user_pfp/defaultpfp.jpg",
      newUsername: '',
      isEditingUsername: false
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
    edit() {
      this.newUsername = this.user.username;
      this.isEditingUsername = true;
    },
    async saveUsername() {
      if (!this.newUsername.trim()) {
          alert('Username cannot be empty');
          return;
      }

      if (this.newUsername === this.user.username) {
          this.isEditingUsername = false;
          return;
      }

      try {
          const auth = JSON.parse(localStorage.getItem('auth'));
          if (!auth || !auth.user) {
              this.$router.push('/login');
              return;
          }

          const res = await fetch(`http://localhost:3000/api/users/${this.user.id}/username`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': auth.user.id.toString() // Using your existing auth system
              },
              body: JSON.stringify({ newUsername: this.newUsername })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update username');

          // Update local user data
          this.user.username = data.user.username;
          this.isEditingUsername = false;

          // Update auth in localStorage
          localStorage.setItem('auth', JSON.stringify({
              loggedIn: true,
              user: this.user
          }));
          
          alert('Username updated successfully');
      } catch (err) {
          alert(err.message || 'Error updating username');
      }
    },
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
  border: none;
  border-radius: 6px;
  cursor: pointer;
  justify-content: center;
  margin-left: 15px;
  width: 65px;
  height: auto;
}
.logout-btn img{
  width: 54px;
  height: auto;
}

.edit-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  justify-content: center;
  width: 55px;
  height: auto;
}
.edit-btn img{
  width: 44px;
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
