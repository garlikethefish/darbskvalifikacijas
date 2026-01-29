<template>
  <header>
    <div class="header-top">
      <Title @language-change="onLanguageChange" />
    </div>
    <HamburgerMenu @toggle="toggleMenu" />
    <NavBar :isMenuOpen="isMenuOpen" @close="closeMenu" />
  </header>

  <main class="layout-wrapper" @click="closeMenu">
    <router-view class="page-content" :key="language" />
  </main>

  <footer>
    <Footer />
  </footer>
</template>

<script>
import NavBar from './components/NavBar.vue'
import HamburgerMenu from './components/HamburgerMenu.vue'
import Title from './components/Title.vue'
import Footer from './components/Footer.vue'
import LanguageToggle from './components/LanguageToggle.vue'
import { getCurrentLanguage } from './services/translations.js'

export default {
  components: {
    Title,
    NavBar,
    HamburgerMenu,
    Footer,
    LanguageToggle
  },
  data() {
    return {
      isMenuOpen: false,
      language: 'en'
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
      }
    },
    onLanguageChange(lang) {
      this.language = lang;
      this.$forceUpdate();
    }
  },
  mounted() {
    this.language = getCurrentLanguage();
  }
};
</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 50vh;
}

.page-content {
  flex: 1;
}

@media (max-width: 500px) {
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 2px solid var(--accent-color);
    padding: 10px 0;
  }

  .header-top {
    padding: 0 10px;
  }
}
</style>
