<template>
    <div class="title-container">
        <div></div>
        <div class="logo-section">
            <img class="title" @click="title" :src="logoSrc" />
        </div>
        <div class="right-section">
            <img v-if="isLoggedIn" class="add-review-button" @click="create_review" :src="'./src/assets/add_review.png'"/>
            <img v-if="isLoggedIn" class="profile-button" @click="profile" :src="'./src/assets/loggedin.png'"/>
            <img v-else class="login-button" @click="login" :src="'./src/assets/login.png'" />
            <button @click="toggleTheme" id="theme-toggle" class="theme-toggle"><img id="theme-icon" class="theme-toggle" :src="themeIcon"/></button>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      isLightMode: false, // Default theme
      isLoggedIn: false
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
    profile() {
      this.$router.push('profile');
    },
    create_review() {
      this.$router.push('create-review');
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
    }
  }
};
</script>


<style scoped>
.login-button {
    cursor: pointer;
    max-width: 50px;
    height: auto;
    }
.profile-button{
  cursor: pointer;
  max-width: 50px;
  height: auto;
}
.add-review-button{
  cursor: pointer;
  max-width: 50px;
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
    gap:25px;
    justify-content: right;
    margin-left: -20px;
    margin-right: 20px;
}

.theme-toggle {
  display: flex;
    cursor: pointer;
    font-size: 34px; 
    background: none; 
    max-width: 50px;
    height: auto;
    border: none; 
    outline: none; 
}
@media (max-width: 500px) {
  .title {
    max-width: 200px;
    margin-left: 0; 
    margin-right: 0; 
    text-align: center;
    padding: 0;
    display: block;  
  }
  .login-button {
    margin:auto;
    max-width: 40px;
    max-height: 40px;
  }
  .profile-button{
    margin:auto;
    max-width: 40px;
    max-height: 40px;
  }
  .add-review-button{
    margin:auto;
    max-width: 40px;
    max-height: 40px;
  }
  .theme-toggle {
    max-width: 40px;
    height: auto;
  }
  .right-section{
    display: flex;
    gap:15px;
    margin-left: 0px;
    margin-right: 15px;
  }
  .title-container{
    position: sticky;
    top: 0;
    z-index: 100;
  }
}
</style>
