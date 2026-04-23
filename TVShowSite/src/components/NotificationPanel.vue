<template>
  <div class="notification-panel-wrapper" ref="wrapper">
    <!-- Notification Bell Button -->
    <button 
      ref="bellBtn"
      class="notification-bell"
      @click="togglePanel"
      :class="{ active: showPanel, 'has-unread': unreadCount > 0 }"
    >
      <span class="bell-icon"><SvgIcon name="bell-ring" :size="36" /></span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Dev Tools Button (for testing notifications) -->
    <!-- <button 
      v-if="isDev"
      class="dev-tools-btn"
      @click="toggleDevTools"
      title="Developer Test Tools"
    >
      <SvgIcon name="settings" :size="36" />
    </button> -->

    <!-- Teleport dropdowns to body so they escape header overflow:hidden -->
    <Teleport to="body">

    <!-- Notification Panel -->
    <div v-if="showPanel" class="notification-panel" :style="panelStyle" @click.stop>
      <div class="panel-header">
        <h3>Notifications</h3>
        <div class="header-actions">
          <button 
            v-if="notifications.length > 0"
            @click="markAllAsRead" 
            class="mark-read-btn"
            title="Mark all as read"
          >
            <SvgIcon name="check" :size="16" />
          </button>
          <button 
            v-if="notifications.length > 0"
            @click="clearAllNotifications"
            class="delete-all-btn"
            title="Delete all notifications"
          >
            <SvgIcon name="trash" :size="16" />
          </button>
          <button @click="closePanel" class="close-btn"><SvgIcon name="close" :size="18" /></button>
        </div>
      </div>

      <div class="panel-content">
        <!-- Empty State -->
        <div v-if="notifications.length === 0" class="empty-state">
          <p>No notifications yet</p>
          <p class="hint">Follow shows to get notified about new episodes!</p>
        </div>

        <!-- Notification List -->
        <div v-else class="notifications-list">
          <div 
            v-for="notif in notifications" 
            :key="notif.id"
            class="notification-item"
            :class="{ unread: !notif.is_read }"
            @click="markAsRead(notif.id)"
          >
            <div class="notif-icon">
              <SvgIcon v-if="notif.notification_type === 'new_episode'" name="play" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'season_release'" name="bell-ring" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'like'" name="heart" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'comment'" name="chat" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'mention'" name="mention" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'new_review'" name="note" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'follow'" name="heart-fill" :size="20" />
              <SvgIcon v-else-if="notif.notification_type === 'cosmetic_unlock'" name="sparkle" :size="20" />
              <SvgIcon v-else name="bell" :size="20" />
            </div>
            
            <div class="notif-content">
              <p class="notif-title">{{ notif.message }}</p>
              <p class="notif-time">{{ formatTime(notif.created_at) }}</p>
            </div>

            <div v-if="!notif.is_read" class="unread-dot"></div>

            <button 
              class="notif-remove-btn"
              @click.stop="removeNotification(notif.id)"
              title="Remove notification"
            >
              <SvgIcon name="close" :size="14" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Click outside to close -->
    <div v-if="showPanel" class="panel-overlay" @click="closePanel"></div>
    <!-- Developer Test Tools Panel (for testing notifications)
    <div v-if="showDevTools && isDev" class="dev-tools-panel" :style="devToolsStyle" @click.stop>
      <div class="dev-header">
        <h4>Test Notifications</h4>
        <button @click="toggleDevTools" class="dev-close"><SvgIcon name="close" :size="16" /></button>
      </div>
      
      <div class="dev-buttons">
        <button @click="addTestNotification('new_episode')" class="test-btn">
          <SvgIcon name="play" :size="16" /> New Episode
        </button>
        <button @click="addTestNotification('season_release')" class="test-btn">
          <SvgIcon name="bell-ring" :size="16" /> Season Release
        </button>
        <button @click="addTestNotification('comment')" class="test-btn">
          <SvgIcon name="chat" :size="16" /> New Comment
        </button>
        <button @click="addTestNotification('like')" class="test-btn">
          <SvgIcon name="heart" :size="16" /> New Like
        </button>
        <button @click="addTestNotification('mention')" class="test-btn">
          <SvgIcon name="mention" :size="16" /> Mention
        </button>
        <button @click="addTestNotification('cosmetic_unlock')" class="test-btn">
          <SvgIcon name="sparkle" :size="16" /> Cosmetic Unlock
        </button>
        <button @click="clearAllNotifications" class="test-btn clear">
          <SvgIcon name="trash" :size="16" /> Clear All
        </button>
      </div>

      <div class="weight-switcher">
        <p class="switcher-label"><SvgIcon name="settings" :size="14" /> Icon Style</p>
        <div class="weight-buttons">
          <button
            v-for="w in solarWeights"
            :key="w"
            @click="setSolarWeight(w)"
            :class="['weight-btn', { active: currentSolarWeight === w }]"
          >{{ w }}</button>
        </div>
      </div>
    </div>
    <div v-if="showDevTools && isDev" class="dev-overlay" @click="toggleDevTools"></div> -->

    </Teleport>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'
import { solarConfig, SOLAR_WEIGHTS } from '@/services/solarConfig.js'

export default {
  components: { SvgIcon },
  computed: {
    currentSolarWeight() {
      return solarConfig.weight;
    },
    solarWeights() {
      return SOLAR_WEIGHTS;
    }
  },
  data() {
    return {
      showPanel: false,
      notifications: [],
      unreadCount: 0,
      pollInterval: null,
      showDevTools: false,
      isDev: import.meta.env.DEV || window.location.hostname === 'localhost',
      isTestingNotifications: false,
      panelStyle: {},
      devToolsStyle: {}
    };
  },
  methods: {
    togglePanel() {
      this.showPanel = !this.showPanel;
      if (this.showPanel) {
        this.updatePanelPosition();
        if (!this.isTestingNotifications) {
          this.loadNotifications();
        }
      }
    },
    closePanel() {
      this.showPanel = false;
    },
    async loadNotifications() {
      if (!localStorage.getItem('auth')) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        const res = await fetch('/api/notifications', {
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });

        if (res.status === 401) {
          this.notifications = [];
          this.unreadCount = 0;
          return;
        }

        const raw = await res.text();
        if (!res.ok) {
          console.error('Error loading notifications:', res.status, raw);
          this.notifications = [];
          this.unreadCount = 0;
          return;
        }

        this.notifications = raw ? JSON.parse(raw) : [];
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error loading notifications:', error);
        this.notifications = [];
        this.unreadCount = 0;
      }
    },
    async markAsRead(notificationId) {
      if (!localStorage.getItem('auth')) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });
        
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
          notif.is_read = 1;
          this.updateUnreadCount();
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    async markAllAsRead() {
      if (!localStorage.getItem('auth')) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      
      // Immediately update UI (optimistic update)
      this.notifications.forEach(n => {
        n.is_read = 1;
      });
      this.updateUnreadCount();
      
      // Single bulk request to mark all as read
      fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': auth.user.id.toString()
        }
      }).catch(error => {
        console.error('Error marking all notifications as read:', error);
      });
    },
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.is_read).length;
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    },
    startPolling() {
      // Poll for new notifications every 30 seconds (skip if testing)
      this.pollInterval = setInterval(() => {
        if (!this.isTestingNotifications) {
          this.loadNotifications();
        }
      }, 30000);
    },
    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
    },
    setSolarWeight(w) {
      solarConfig.setWeight(w);
    },
    toggleDevTools() {
      this.showDevTools = !this.showDevTools;
      if (this.showDevTools) {
        this.updateDevToolsPosition();
      }
    },
    updatePanelPosition() {
      const btn = this.$refs.bellBtn;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      this.panelStyle = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${Math.max(8, window.innerWidth - rect.right)}px`,
      };
    },
    updateDevToolsPosition() {
      const btn = this.$refs.bellBtn;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      this.devToolsStyle = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${Math.max(8, window.innerWidth - rect.right + 50)}px`,
      };
    },
    addTestNotification(type) {
      const testNotifications = {
        new_episode: {
          id: Date.now(),
          message: "Breaking Bad: Season 5, Episode 16 is now available",
          notification_type: 'new_episode',
          created_at: new Date(),
          is_read: 0
        },
        season_release: {
          id: Date.now(),
          message: "The Office: Season 3 has been released!",
          notification_type: 'season_release',
          created_at: new Date(),
          is_read: 0
        },
        comment: {
          id: Date.now(),
          message: "You have a new comment on your review",
          notification_type: 'comment',
          created_at: new Date(),
          is_read: 0
        },
        like: {
          id: Date.now(),
          message: "Your review of Stranger Things got 3 new likes",
          notification_type: 'like',
          created_at: new Date(),
          is_read: 0
        },
        mention: {
          id: Date.now(),
          message: "johndoe mentioned you in a comment",
          notification_type: 'mention',
          created_at: new Date(),
          is_read: 0
        },
        cosmetic_unlock: {
          id: Date.now(),
          message: "You unlocked a new cosmetic: Sparkle Trail (Common)",
          notification_type: 'cosmetic_unlock',
          created_at: new Date(),
          is_read: 0
        }
      };

      const notif = testNotifications[type];
      if (notif) {
        // Add to beginning for visibility
        this.notifications.unshift(notif);
        this.updateUnreadCount();
        this.isTestingNotifications = true;
      }
    },
    async clearAllNotifications() {
      if (!localStorage.getItem('auth')) return;
      const auth = JSON.parse(localStorage.getItem('auth'));

      // Optimistic UI update
      this.notifications = [];
      this.updateUnreadCount();
      this.isTestingNotifications = false;

      // Delete all on server
      fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': auth.user.id.toString()
        }
      }).catch(error => {
        console.error('Error deleting all notifications:', error);
      });
    },
    async removeNotification(notificationId) {
      if (!localStorage.getItem('auth')) return;
      const auth = JSON.parse(localStorage.getItem('auth'));

      // Optimistic UI update
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.updateUnreadCount();

      // Delete on server
      fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': auth.user.id.toString()
        }
      }).catch(error => {
        console.error('Error deleting notification:', error);
      });
    }
  },
  mounted() {
    const auth = localStorage.getItem('auth');
    if (auth) {
      this.loadNotifications();
      this.startPolling();
    }
  },
  beforeUnmount() {
    this.stopPolling();
  }
};
</script>

<style scoped>
.notification-panel-wrapper {
  position: relative;
  width: auto;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
}

.notification-bell:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.notification-bell.active {
  background: rgba(112, 233, 116, 0.15);
}

.bell-icon {
  display: inline-block;
}

.notification-bell.has-unread .bell-icon {
  animation: bellRing 0.5s ease-in-out;
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: linear-gradient(135deg, var(--accent-color), #48bb78);
  color: var(--dark-bg-color);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(112, 233, 116, 0.4);
}

.notification-panel {
  position: fixed;
  width: 380px;
  max-height: 500px;
  background:
    linear-gradient(135deg, rgba(30, 28, 39, 0.85) 0%, rgba(25, 61, 39, 0.75) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(112, 233, 116, 0.15);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(112, 233, 116, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: auto;
  gap: 1rem;
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark-read-btn:hover {
  background: rgba(112, 233, 116, 0.15);
  color: #fff;
  transform: scale(1.1);
}

.delete-all-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.delete-all-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  opacity: 1;
  transform: scale(1.1);
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 1.3rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #fff;
}

.panel-content {
  height: 345px;
  overflow-y: auto;
  overflow-x: scroll;
  width: auto;
  flex-shrink: 0;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  width: auto;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  width: auto;
}

.notification-item:hover {
  background: rgba(112, 233, 116, 0.08);
}

.notification-item.unread {
  background: rgba(112, 233, 116, 0.04);
  width: auto;
}

.notif-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: auto;
}

.notif-content {
  flex: 1;
  width: auto;
}

.notif-title {
  margin: 0;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  word-break: break-word;
}

.notif-time {
  margin: 0.3rem 0 0 0;
  color: #999;
  font-size: 0.85rem;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.notif-remove-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.3s ease;
  margin-left: 0.5rem;
  width: auto;
}

.notif-remove-btn:hover {
  color: #ff6b6b;
  transform: scale(1.2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: #999;
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.5rem;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

/* Custom scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(112, 233, 116, 0.2);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(112, 233, 116, 0.4);
}

/* Developer Tools Styles */
.dev-tools-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
  margin-left: 0.5rem;
  opacity: 0.6;
}

.dev-tools-btn:hover {
  background: rgba(255, 193, 7, 0.2);
  opacity: 1;
  transform: rotate(45deg);
}

.dev-tools-panel {
  position: fixed;
  width: 280px;
  background:
    linear-gradient(135deg, rgba(30, 28, 39, 0.9) 0%, rgba(25, 61, 39, 0.8) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  z-index: 10001;
  margin-top: 0.5rem;
  animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dev-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 193, 7, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: auto;
}

.dev-header h4 {
  margin: 0;
  color: #ffc107;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dev-close {
  background: none;
  border: none;
  color: #ffc107;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.dev-close:hover {
  color: #fff;
}

.dev-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  width: auto;
}

.test-btn {
  padding: 0.7rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffc107;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.test-btn:hover {
  background: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
  transform: translateX(4px);
}

.test-btn.clear {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  margin-top: 0.5rem;
}

.test-btn.clear:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
}

.weight-switcher {
  padding: 0.75rem 1rem 1rem;
  border-top: 1px solid rgba(255, 193, 7, 0.2);
}

.switcher-label {
  margin: 0 0 0.5rem 0;
  color: #ffc107;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.weight-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.weight-btn {
  padding: 0.3rem 0.55rem;
  background: rgba(255, 193, 7, 0.08);
  border: 1px solid rgba(255, 193, 7, 0.25);
  color: #ffc107;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.weight-btn:hover {
  background: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.weight-btn.active {
  background: #ffc107;
  border-color: #ffc107;
  color: #1a0f2e;
}

.dev-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
}

@media (max-width: 768px) {
  .notification-panel {
    width: calc(100vw - 2rem) !important;
    right: 1rem !important;
    left: auto !important;
  }

  .dev-tools-panel {
    width: calc(100vw - 2rem) !important;
    right: 1rem !important;
    left: auto !important;
  }
}
</style>
