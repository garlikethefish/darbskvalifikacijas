<template>
    <div class="title-container">
        <div></div>
        <div class="logo-section">
            <img class="title" @click="title" :src="'./src/assets/logo_long.png'" />
        </div>
        <div class="right-section">
            <img class="login-button" @click="login" :src="'./src/assets/login.png'"/>
            <button @click="theme" id="theme-toggle" class="theme-toggle"><img id="theme-icon" class="theme-toggle" :src="themeIcon"/></button>
        </div>
    </div>
</template>

<script>
    export default {
    data() {
        return {
            isLightMode: false
        };
    },
    computed: {
        themeIcon() {
            return this.isLightMode ? './src/assets/sun.png' : './src/assets/moon.png';
        }
    },
    methods: {
        title() {
        this.$router.push('/');
    },
        login() {
        this.$router.push('login');
    },
    theme() {
            this.isLightMode = !this.isLightMode;
        }
    
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
