<template>
    <div class="title-container">
        <div></div>
        <div class="logo-section">
            <img class="title" @click="title" :src="logoSrc" />
        </div>
        <div class="right-section">
            <img class="login-button" @click="login" :src="'./src/assets/login.png'"/>
            <button @click="toggleTheme" id="theme-toggle" class="theme-toggle"><img id="theme-icon" class="theme-toggle" :src="themeIcon"/></button>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      isLightMode: false, // Default theme
    };
  },
  computed: {
    themeIcon() {
      return this.isLightMode ? './src/assets/sun.png' : './src/assets/moon.png';
    },
    logoSrc() {
    return this.isLightMode
      ? './src/assets/logo_long_dark.png' // if is light mode then darker logo should be used for contrast
      : './src/assets/logo_long.png';
  }
  },
  methods: {
    title() {
      this.$router.push('/');
    },
    login() {
      this.$router.push('login');
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
    const initUserTheme = this.getMediaPreference();
    this.setTheme(initUserTheme);
  }
};
</script>


<style scoped>
.login-button {
    cursor: pointer;
    max-width: 60px;
    height: auto;
    }
.title-container {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;  
}
.title {
    cursor: pointer;
    max-width: 400px;
    height: auto;
    padding-bottom: 20px;
    margin:0
}
.logo-section{
    display: flex;
    justify-content: center;
}
.right-section{
    display: flex;
    gap:40px;
    justify-content: right;
    margin-left: -20px;
    margin-right: 20px;
}

.theme-toggle {
    cursor: pointer;
    font-size: 34px; 
    background: none; 
    max-width: 40px;
    max-height: auto;
    border: none; 
    outline: none; 
}
</style>
