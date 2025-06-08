<script>
  import NavBar from './components/NavBar.vue'
  import HamburgerMenu from './components/HamburgerMenu.vue'
  import Title from './components/Title.vue'
  import Footer from './components/Footer.vue'
  export default {
  name: 'App',
  components: { // registers the components so that they can be used in the script
    Title,
    NavBar,
    HamburgerMenu,
    Footer
  }
};
</script>

<template>
  <header>
    <Title></Title>
    <NavBar></NavBar>
    <HamburgerMenu></HamburgerMenu>
  </header>
  
  <main class="layout-wrapper">
    <router-view class="page-content"/>
  </main>
  <footer>
    <Footer></Footer>
  </footer>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 50vh;
}
.page-content {
  flex: 1;
}
</style>
