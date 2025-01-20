<template>
    <nav class="nav-links">
            <router-link class="link" to="/">Home</router-link>
            <router-link class="link" to="reviews">Reviews</router-link>
            <div class="dropdown">
                <router-link class="link dropdown-btn" to="updates">Updates</router-link>
                <div class="dropdown-content">
                    <a href="site_updates/update_02_10_2024.html">02-10-2024</a>
                    <a href="site_updates/update_18_09_2024.html">18-09-2024</a>
                    <a href="site_updates/update_26_09_2024.html">26-09-2024</a>
                </div>
            </div>
            <router-link class="link" to="about">About</router-link>
            <router-link class="link" to="contact">Contact</router-link>
            <router-link class="link" to="donate">Donate</router-link>
            <router-link class="link" to="premium">Premium</router-link>
        </nav>
</template>
<style>
    div{
        display: table;
        width: 100%;
        table-layout: fixed;
    }
    .nav-links {
        display: flex;
        justify-content: center; 
        gap: 20px; 
        margin-top: 30px;
    }
    .link{
        margin-left: 8px;
        margin-right: 8px;
    }
    .link:hover{
        color: var(--light-bg-color);
    }
    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 100px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
        top: 100%;  
        left: 0;
    }

    .dropdown-content a {
        text-align: center;
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
    }

    .dropdown-content a:hover {
        background-color: #dbdbdb;
        display: block;
    }

    .dropdown:hover .dropdown-content {
        display: block;
    }

    .dropdown-btn {
        text-decoration: none;
        display: inline-block;
    }
</style>
<script>
export default {
  name: "NavBar"
}
</script>