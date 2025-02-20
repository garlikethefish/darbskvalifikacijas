<template>
    <div @click="hamburgerMenu" class="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
    </div>
</template>
<script>
export default{
    methods:{
        hamburgerMenu(){
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const navLinks = document.querySelector('.nav-links');
            const mainContent = document.querySelector('main');
            hamburgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mainContent.classList.toggle('shifted');
        });
    }
  }
}
</script>