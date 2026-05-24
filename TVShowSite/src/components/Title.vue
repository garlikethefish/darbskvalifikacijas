<template>
    <div class="title-container">
        <div class="left-section"></div>
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
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
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
    // Iestata noklusējuma lietotāja motīvu uz lietotāja izvēlēto
    const initUserTheme = this.getMediaPreference();
    this.setTheme(initUserTheme);
    // Ielādes laikā pārbauda pieteikšanās statusu no localStorage
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
  box-shadow: none;
}

:global([data-theme="light"]) .profile-pic {
  outline: 2px solid rgba(28, 166, 102, 0.7);
  box-shadow: 0 0 0 3px rgba(28, 166, 102, 0.08);
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

:global([data-theme="light"]) .right-section :deep(:where(.add-review-button, .theme-toggle, .add-review-button:hover, .theme-toggle:hover)) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none;
}

:global([data-theme="light"]) .right-section :deep(:where(.add-review-button, .theme-toggle) :where(.svg-icon, svg)) {
  border: none !important;
  box-shadow: none !important;
  color: rgb(24, 42, 54);
  filter: none !important;
  outline: none;
}

.right-section :deep(:where(.svg-icon, svg, svg *)) {
  stroke: none !important;
  stroke-width: 0 !important;
}

.login-button:hover,
.profile-button:hover,
.add-review-button:hover {
    opacity: 0.75;
}
.title-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  width: 100%;
  table-layout: auto;
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

:global([data-theme="light"]) .title {
    filter: saturate(1.75) contrast(1.28) brightness(0.94) drop-shadow(0 4px 8px rgba(31, 41, 51, 0.08));
}

:global(.header-compact) .title {
    height: 65px;
    padding-bottom: 6px;
}
.logo-section{
    display: flex;
    justify-content: center;
    grid-column: 2;
    justify-self: center;
    width: auto;
    table-layout: auto;
}
.left-section {
    display: block;
    grid-column: 1;
    width: auto;
    min-width: 0;
    table-layout: auto;
}
.right-section{
    display: flex;
    grid-column: 3;
    gap: 10px;
    width: auto;
    justify-content: flex-end;
    align-items: center;
    margin-right: 20px;
    margin-left: 0;
    justify-self: end;
    table-layout: auto;
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
  .title-container {
    gap: 8px;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .left-section {
    display: none;
  }

  .logo-section {
    grid-column: 1;
    justify-content: flex-start;
    justify-self: start;
  }

  .title {
    max-width: 145px;
    padding: 0;
    height: 52px;
    object-fit: contain;
  }
  :global(.header-compact) .title {
    height: 40px;
    padding-bottom: 2px;
  }
  .login-button,
  .profile-button,
  .add-review-button {
    width: 34px;
    height: 34px;
  }
  .theme-toggle {
    max-width: 34px;
    height: 34px;
  }
  .right-section{
    display: flex;
    grid-column: 2;
    gap: 6px;
    margin-right: 4px;
    min-width: 0;
  }

}

@media (max-width: 380px) {
  .title {
    max-width: 118px;
  }

  .right-section {
    gap: 4px;
  }
}
</style>
