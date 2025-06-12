<template>
  <header>
    <Title />
    <HamburgerMenu @toggle="toggleMenu" />
    <NavBar :isMenuOpen="isMenuOpen" @close="closeMenu" />
  </header>

  <main class="layout-wrapper" @click="closeMenu">
    <router-view class="page-content" />
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

export default {
  components: {
    Title,
    NavBar,
    HamburgerMenu,
    Footer
  },
  data() {
    return {
      isMenuOpen: false
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
    }
  }
};
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 50vh;
}
.page-content {
  flex: 1;
}
@media (max-width: 500px) {
  header{
    position:sticky;
    top:0;
    z-index: 100;
    border-bottom: 2px solid var(--accent-color);
    padding: 10px 0;
  }
}
</style>
