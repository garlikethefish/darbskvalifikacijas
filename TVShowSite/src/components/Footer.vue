<template>
    <footer class="social-media">
        <p>All rights reserved: 2025</p>
        <p>Our social media</p>
        <div class="center">
            <a href="https://www.instagram.com/" ><img class="social-icon" :src="'./src/assets/ig.png'"></a>
            <a href="https://www.youtube.com/" ><img class="social-icon" :src="'./src/assets/youtube.png'"></a>
        </div>
    </footer>
</template>

<style scoped>
    footer{
        bottom: 0;
        padding-top: 20px;
        width:100%;
        background: var(--dark-bg-color);
        min-height: 50px;
    }
    p{
        display: block;
        text-align: center;
    }
    a{
        padding: 5px;
    }
    .center{
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
    }
    .social-icon{
        max-width: 50px;
    }
</style>