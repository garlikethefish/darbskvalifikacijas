<template>
    <div class="title-container">
        <img class="title" @click="title" :src="'./src/assets/logo_long.png'" />
        <button id="theme-toggle" class="theme-toggle">🌙</button>
    </div>
</template>

<script>
    export default {
    methods: {
        title() {
        this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;  
}
.title {
    cursor: pointer;
    max-width: 400px;
    height: auto;
    margin: 0 auto;
    padding-bottom: 20px;
}


.theme-toggle {
    cursor: pointer; 
    font-size: 34px; 
    background: none; 
    border: none; 
    padding: 0; 
    display: inline;
    outline: none; 
    position: absolute; 
    right: 20px; 
}
</style>
