<template>
  <div id="app">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1>{{ user.username }}'s {{ t('profile') }}</h1>
          <p class="subtitle">{{ reviewCount }} {{ t('reviews') }}</p>
        </div>
      </div>
    </header>

    <div class="profile-container">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="pfp-section">
            <div class="pfp-wrapper" @click="showProfilePictureModal = true">
              <img 
                class="profile-icon" 
                :src="profileImageUrl || defaultIcon"
                alt="Profile Icon"
              />
              <div class="pfp-overlay" v-if="!isUploading">
                <span>⚙️</span>
              </div>
              <div class="upload-spinner" v-if="isUploading">
                <div class="spinner"></div>
              </div>
              <img v-if="user.role === 'admin'" src="../assets/admin_gear.png" alt="admin icon" class="admin-icon"/>
            </div>
          </div>

          <!-- Profile Picture Selection Modal -->
          <div v-if="showProfilePictureModal" class="modal-overlay" @click.self="showProfilePictureModal = false">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Select Profile Picture</h3>
                <button class="modal-close" @click="showProfilePictureModal = false">✕</button>
              </div>
              
              <div class="modal-body">
                <!-- Default Profile Pictures -->
                <div class="pfp-section-title">Default Pictures</div>
                <div class="default-pfp-grid">
                  <div 
                    v-for="n in 6" 
                    :key="n" 
                    class="default-pfp-option"
                    :class="{ selected: profileImageUrl === `/assets/user_pfp/pfp${n}.png` }"
                    @click="selectDefaultProfilePicture(n)"
                  >
                    <img :src="`/assets/user_pfp/pfp${n}.png`" :alt="`Default ${n}`" />
                    <div v-if="profileImageUrl === `/assets/user_pfp/pfp${n}.png`" class="checkmark">✓</div>
                  </div>
                </div>

                <!-- Upload Custom Picture -->
                <div class="pfp-section-title">Upload Custom Picture</div>
                <div class="upload-area">
                  <input 
                    type="file" 
                    ref="fileInput" 
                    @change="handleFileUpload" 
                    accept="image/*" 
                    style="display: none;"
                  />
                  <button class="upload-btn" @click="triggerFileUpload" :disabled="isUploading">
                    <span v-if="!isUploading">📤 Upload Image</span>
                    <span v-else>Uploading...</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="user-details">
            <div class="username-section">
              <h2 class="username" v-if="!isEditingUsername">
                {{ user.username }}
                <span v-if="user.role==='admin'" class="admin-label"> (ADMIN)</span>
              </h2>
              <div v-else class="edit-username-form">
                <input v-model="newUsername" class="username-input" />
                <div class="edit-buttons">
                  <button class="save-btn" @click="saveUsername">{{ t('save') }}</button>
                  <button class="cancel-btn" @click="isEditingUsername=false">{{ t('cancel') }}</button>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button class="edit-btn" @click="edit" v-if="!isEditingUsername">
                <img src="../assets/edit.png">
                <span>{{ t('editProfile') }}</span>
              </button>
              <button class="logout-btn" @click="logout">
                <img src="../assets/logout.png">
                <span>{{ t('logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section" v-if="reviews.length">
        <div class="section-header">
          <h2>{{ t('userReviews') }}</h2>
          <button class="new-review-btn" @click="new_review">
            + {{ t('newReview') }}
          </button>
        </div>

        <div class="reviews-grid">
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <img v-if="review.episode_image" :src="review.episode_image" alt="Episode Still" class="episode-still"/>
            <div class="review-info">
              <strong class="episode-title">{{ review.episode_title }}</strong>
              <span class="series-info">{{ review.series_title }} | S{{ review.season_number }}E{{ review.episode_number }}</span>
              <p :class="['rating-text', `rating-${review.rating}`]">
                {{ t('rating') }}: {{ review.rating }}/5
              </p>
              <p class="review-text"><b>{{ review.review_title }}</b>: {{ review.review_text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📝</div>
        <p>{{ t('noReviewsYet') }}</p>
        <button class="new-review-btn" @click="new_review">
          + {{ t('newReview') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  data() {
    return {
      user: {},
      reviews: [],
      reviewCount: 0,
      defaultIcon: "/assets/user_pfp/defaultpfp.jpg",
      newUsername: '',
      isEditingUsername: false,
      isUploading: false,
      currentLanguage: 'en',
      profileImageUrl: null,
      showProfilePictureModal: false
    };
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    getProfileImageUrl(profilePicture) {
      if (!profilePicture) return this.defaultIcon;
      // Add cache buster to force fresh image load
      const cacheBuster = Math.random().toString(36).substring(7);
      return `${profilePicture}?cb=${cacheBuster}`;
    },
    edit() {
      this.newUsername = this.user.username;
      this.isEditingUsername = true;
    },
    triggerFileUpload() {
      if (!this.isUploading) {
        this.$refs.fileInput.click();
      }
    },
    async selectDefaultProfilePicture(n) {
      const defaultPath = `/assets/user_pfp/pfp${n}.png`;
      this.profileImageUrl = defaultPath;
      
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.user.id}/profile-picture-default`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ picturePath: defaultPath })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update profile picture');

        this.user.profile_picture = defaultPath;
        auth.user.profile_picture = defaultPath;
        localStorage.setItem('auth', JSON.stringify(auth));
        
        console.log('Default profile picture selected:', defaultPath);
        alert('Profile picture updated successfully!');
        this.showProfilePictureModal = false;
      } catch(err) {
        console.error('Error selecting default profile picture:', err);
        alert(err.message || 'Error updating profile picture');
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.isUploading = true;

      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        console.log('Starting upload - Auth user ID:', auth.user.id);
        console.log('Uploading file:', event.target.files[0].name);
        
        const formData = new FormData();
        formData.append('profilePicture', file);

        const uploadUrl = `/api/users/${this.user.id}/profile-picture`;
        console.log('Upload URL:', uploadUrl);
        
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': auth.user.id.toString()
          },
          body: formData
        });

        console.log('Upload response status:', res.status);
        const data = await res.json();
        console.log('Upload response data:', data);
        
        if (!res.ok) throw new Error(data.message || 'Failed to upload profile picture');

        // Update the user profile picture
        const newPicturePath = data.profilePicture;
        this.user.profile_picture = newPicturePath;
        
        // Update the displayed image with cache buster
        const cacheBuster = Date.now();
        this.profileImageUrl = `${newPicturePath}?t=${cacheBuster}`;
        
        // Update localStorage
        auth.user.profile_picture = newPicturePath;
        localStorage.setItem('auth', JSON.stringify(auth));
        
        console.log('Profile picture updated to:', newPicturePath);
        console.log('Display URL:', this.profileImageUrl);
        alert('Profile picture updated successfully!');
        this.showProfilePictureModal = false;
        
        // Force Vue to re-render
        await this.$nextTick();
        this.$forceUpdate();
      } catch(err) {
        console.error('Upload error:', err);
        alert(err.message || 'Error uploading profile picture');
      } finally {
        this.isUploading = false;
        // Reset the file input
        this.$refs.fileInput.value = '';
      }
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
        auth.user.username = data.user.username;
        localStorage.setItem('auth', JSON.stringify({ loggedIn: true, user: this.user }));
        alert('Username updated successfully');
        location.reload();
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
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth?.loggedIn) {
      this.$router.push('/login');
      return;
    }
    this.user = auth.user;
    
    // Initialize profile image URL
    if (this.user.profile_picture) {
      this.profileImageUrl = this.user.profile_picture;
    }
    
    this.fetchUserReviews(this.user.id);

    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.$forceUpdate();
    });
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.$forceUpdate();
    });
  }
};
</script>
<style scoped>
/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--medium-bg-color) 100%);
  color: var(--text-color);
  padding: 60px 20px;
  margin-bottom: 40px;
}

.hero-band {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-inner h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  color: var(--subtitle-color);
}

/* Profile Container */
.profile-container {
  max-width: 1200px;
  margin: 0 auto 60px auto;
  padding: 0 20px;
}

/* Profile Card */
.profile-card {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 50px 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 30px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 15px;
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  color: var(--accent-color);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pfp-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
}

.default-pfp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.default-pfp-option {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.default-pfp-option img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.default-pfp-option:hover img {
  transform: scale(1.05);
}

.default-pfp-option.selected {
  border-color: var(--accent-color);
  box-shadow: 0 0 10px var(--accent-color);
}

.default-pfp-option .checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--accent-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  padding: 15px 25px;
  border: 2px solid var(--accent-color);
  background: var(--accent-color);
  color: var(--text-color);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover:not(:disabled) {
  background: var(--medium-bg-color);
  transform: translateY(-2px);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-header {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  justify-content: center;
}

.pfp-section {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  width: 100%;
}

.pfp-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 140px;
  height: 140px;
}

.profile-icon {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--accent-color);
  transition: all 0.3s ease;
  display: block;
}

.pfp-wrapper:hover .profile-icon {
  filter: brightness(0.6);
}

.pfp-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  pointer-events: none;
}

.pfp-overlay span {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.pfp-wrapper:hover .pfp-overlay {
  opacity: 1;
}

.upload-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.admin-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
  pointer-events: none;
  transform: translate(20%, -20%);
}

/* User Details */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.username-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.username {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  line-height: 1.2;
}

.admin-label {
  color: var(--subtitle-color);
  font-weight: normal;
  font-size: 1.3rem;
}

.edit-username-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.username-input {
  font-size: 1.3rem;
  padding: 12px;
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  background: var(--background-color);
  color: var(--text-color);
  max-width: 400px;
}

.edit-buttons {
  display: flex;
  gap: 10px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.edit-btn, .logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.edit-btn {
  background-color: var(--accent-color);
}

.edit-btn:hover {
  background-color: var(--medium-bg-color);
  transform: translateY(-2px);
}

.logout-btn {
  background-color: var(--light-bg-color);
}

.logout-btn:hover {
  background-color: #c44;
  transform: translateY(-2px);
}

.edit-btn img, .logout-btn img {
  width: 20px;
  height: 20px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: var(--accent-color);
  color: var(--text-color);
}

.save-btn:hover {
  background-color: var(--medium-bg-color);
}

.cancel-btn {
  background-color: var(--light-bg-color);
  color: var(--text-color);
}

.cancel-btn:hover {
  background-color: #888;
}

/* Reviews Section */
.reviews-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--accent-color);
}

.section-header h2 {
  font-size: 2rem;
  margin: 0;
  color: var(--text-color);
}

.new-review-btn {
  background-color: var(--accent-color);
  color: var(--text-color);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-review-btn:hover {
  background-color: var(--medium-bg-color);
  transform: translateY(-2px);
}

/* Reviews Grid */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.review-card {
  background: var(--dark-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.episode-still {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.review-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.episode-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
}

.series-info {
  font-size: 0.9rem;
  color: var(--subtitle-color);
  font-weight: 500;
}

.rating-text {
  font-weight: bold;
  font-size: 1rem;
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

/* Rating Colors */
.rating-1 { color: #ff4c4c; text-shadow: 0 0 8px #ff4c4c; }
.rating-2 { color: #ff884c; text-shadow: 0 0 8px #ff884c; }
.rating-3 { color: #ffd93d; text-shadow: 0 0 8px #ffd93d; }
.rating-4 { color: #a6e22e; text-shadow: 0 0 8px #a6e22e; }
.rating-5 { color: #38c172; text-shadow: 0 0 12px #38c172; }

.rating-text:hover {
  transform: scale(1.05);
}

.review-text {
  font-size: 0.95rem;
  color: var(--text-color);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--dark-bg-color);
  border-radius: 16px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  color: var(--subtitle-color);
  margin-bottom: 30px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 2rem;
  }

  .profile-card {
    padding: 25px;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .pfp-wrapper {
    width: 120px;
    height: 120px;
  }

  .profile-icon {
    width: 120px;
    height: 120px;
  }

  .user-details {
    align-items: center;
  }

  .username-section {
    align-items: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .username {
    font-size: 2rem;
  }
}

@media (max-width: 500px) {
  .hero {
    padding: 40px 15px;
  }

  .hero-inner h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .pfp-wrapper {
    width: 100px;
    height: 100px;
  }

  .profile-icon {
    width: 100px;
    height: 100px;
  }

  .admin-icon {
    width: 35px;
    height: 35px;
  }

  .username {
    font-size: 1.5rem;
  }

  .edit-btn, .logout-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .edit-btn img, .logout-btn img {
    width: 18px;
    height: 18px;
  }
}
</style>
