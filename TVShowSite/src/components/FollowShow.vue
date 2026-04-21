<template>
  <div class="follow-show-container">
    <button 
      v-if="!isFollowing"
      @click="followShow"
      :disabled="isLoading"
      class="follow-btn"
    >
      <span class="icon"><SvgIcon name="star" :size="18" /></span>
      <span>Follow Show</span>
    </button>
    <button 
      v-else
      @click="unfollowShow"
      :disabled="isLoading"
      class="unfollow-btn"
    >
      <span class="icon"><SvgIcon name="star" :size="18" /></span>
      <span>Following</span>
    </button>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'

export default {
  components: { SvgIcon },
  props: {
    seriesId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isFollowing: false,
      isLoading: false
    };
  },
  methods: {
    async checkFollowStatus() {
      if (!localStorage.getItem('auth')) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        const res = await fetch(`/api/followed-shows/${auth.user.id}`);
        const followedShows = await res.json();
        this.isFollowing = followedShows.some(show => show.tmdb_series_id === this.seriesId);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    },
    async followShow() {
      if (!localStorage.getItem('auth')) {
        alert('Please login to follow shows');
        return;
      }

      const auth = JSON.parse(localStorage.getItem('auth'));
      this.isLoading = true;

      try {
        const res = await fetch('/api/follow-show', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ tmdb_series_id: this.seriesId })
        });

        if (res.ok) {
          this.isFollowing = true;
          this.$emit('show-followed', this.seriesId);
        }
      } catch (error) {
        console.error('Error following show:', error);
        alert('Error following show');
      } finally {
        this.isLoading = false;
      }
    },
    async unfollowShow() {
      if (!localStorage.getItem('auth')) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      this.isLoading = true;

      try {
        const res = await fetch('/api/unfollow-show', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ tmdb_series_id: this.seriesId })
        });

        if (res.ok) {
          this.isFollowing = false;
          this.$emit('show-unfollowed', this.seriesId);
        }
      } catch (error) {
        console.error('Error unfollowing show:', error);
        alert('Error unfollowing show');
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.checkFollowStatus();
  }
};
</script>

<style scoped>
.follow-show-container {
  display: inline-block;
}

.follow-btn,
.unfollow-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.follow-btn {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
}

.follow-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.3);
}

.unfollow-btn {
  background: linear-gradient(135deg, rgb(147, 112, 219), rgb(100, 130, 255));
  color: white;
}

.unfollow-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(147, 112, 219, 0.3);
}

.follow-btn:disabled,
.unfollow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .follow-btn,
  .unfollow-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
