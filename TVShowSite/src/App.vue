<script>
  import NavBar from './components/NavBar.vue'
  import Title from './components/Title.vue'
  import Footer from './components/Footer.vue'
  export default {
  name: 'App',
  components: { // registers the components so that they can be used in the script
    Title,
    NavBar,
    Footer
  },
};
</script>


<template>
  <header>
    <Title></Title>
    <NavBar />
  </header>
  <main>
    <router-view/>
  </main>
  <footer>
    <Footer></Footer>
  </footer>
  
</template>

<style>
</style>
