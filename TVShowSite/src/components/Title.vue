<template>
    <div class="title-container">
        <div></div>
        <div class="logo-section">
            <img class="title" @click="title" :src="logoSrc" />
        </div>
        <div class="right-section">
            <button v-if="isLoggedIn" class="add-review-button" @click="create_review" title="New Review"><SvgIcon name="add-review" :size="36" /></button>
            <button v-if="isLoggedIn" class="profile-button" @click="profile" title="Profile">
              <img v-if="profilePicture" :src="profilePicture" class="profile-pic" @error="profilePicture = null" alt="Profile" />
              <SvgIcon v-else name="user" :size="36" />
            </button>
            <button v-else class="login-button" @click="login" title="Login"><SvgIcon name="user" :size="36" /></button>
            <NotificationPanel v-if="isLoggedIn" />
            <button @click="toggleTheme" id="theme-toggle" class="theme-toggle"><SvgIcon :name="isLightMode ? 'sun' : 'moon'" :size="30" /></button>
            <LanguageToggle @language-change="onLanguageChange" />
        </div>
    </div>
</template>

<script>
import LanguageToggle from './LanguageToggle.vue';
import NotificationPanel from './NotificationPanel.vue';
import SvgIcon from './SvgIcon.vue';
import logoLight from '@/assets/logo_long.png';
import logoDark from '@/assets/logo_long_dark.png';

export default {
  components: {
    LanguageToggle,
    NotificationPanel,
    SvgIcon
  },
  data() {
    return {
      isLightMode: false, // Default theme
      isLoggedIn: false,
      profilePicture: null
    };
  },
  computed: {
    logoSrc() {
    return this.isLightMode
      ? logoDark // if is light mode then darker logo should be used for contrast
      : logoLight;
  }
  },
  methods: {
    title() {
      this.$router.push('/');
    },
    login() {
      this.$router.push('/login');
    },
    profile() {
      const auth = JSON.parse(localStorage.getItem('auth') || 'null');
      if (auth?.user?.id) {
        this.$router.push(`/profile/${auth.user.id}`);
      } else {
        this.$router.push('/login');
      }
    },
    create_review() {
      this.$router.push('/create-review');
    },
    onLanguageChange(lang) {
      this.$emit('language-change', lang);
    },
    toggleTheme() {
      this.isLightMode = !this.isLightMode;
      const theme = this.isLightMode ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
    getMediaPreference() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDarkMode ? 'dark' : 'light';
    },
    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.isLightMode = theme === 'light';
    }
  },
  mounted() {
    // set default user theme to the one user has chosen
    const initUserTheme = this.getMediaPreference();
    this.setTheme(initUserTheme);
    // check login status from localStorage on load
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      this.isLoggedIn = parsed.loggedIn === true;
      this.profilePicture = parsed.user?.profile_picture || null;
    }
  }
};
</script>


<style scoped>
.profile-pic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  outline: 2px solid var(--accent-color);
}

.login-button,
.profile-button,
.add-review-button {
    cursor: pointer;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: opacity 0.2s ease;
}

.login-button:hover,
.profile-button:hover,
.add-review-button:hover {
    opacity: 0.75;
}
.title-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  position: relative;  
}
.title {
    cursor: pointer;
    max-width: 400px;
    height: 100px;
    padding-bottom: 20px;
    margin: 0;
    transition: height 0.3s cubic-bezier(0.16,0.84,0.24,1), padding 0.3s cubic-bezier(0.16,0.84,0.24,1);
}

:global(.header-compact) .title {
    height: 65px;
    padding-bottom: 6px;
}
.logo-section{
    display: flex;
    justify-content: center;
    flex: 1;
}
.right-section{
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    align-items: center;
    margin-right: 20px;
    margin-left: auto;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: none;
  width: 40px;
  height: 40px;
  border: none;
  outline: none;
  padding: 0;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.theme-toggle:hover {
  opacity: 0.75;
}

@media (max-width: 500px) {
  .title {
    max-width: 200px;
    padding: 0;
    height: 60px;
  }
  :global(.header-compact) .title {
    height: 44px;
    padding-bottom: 2px;
  }
  .login-button,
  .profile-button,
  .add-review-button {
    width: 36px;
    height: 36px;
  }
  .theme-toggle {
    max-width: 40px;
    height: 40px;
  }
  .right-section{
    display: flex;
    gap: 8px;
    margin-right: 10px;
  }

}
</style>
