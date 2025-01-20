<template>
    <nav class="nav-links">
            <a class="link" href="main.html">Home</a>
            <a class="link" href="reviews.html">Reviews</a>
            <div class="dropdown">
                <a class="link dropdown-btn" href="updates.html">Updates</a>
                <div class="dropdown-content">
                    <a href="site_updates/update_02_10_2024.html">02-10-2024</a>
                    <a href="site_updates/update_18_09_2024.html">18-09-2024</a>
                    <a href="site_updates/update_26_09_2024.html">26-09-2024</a>
                </div>
            </div>
            <a class="link" href="about.html">About</a>
            <a class="link" href="contact.html">Contact</a>
            <a class="link" href="donate.html">Donate</a>
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
        margin-left: 30px;
        margin-right: 30px;
    }
    .link:hover{
        color: rgb(226, 187, 59);
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
        background-color: #f1f1f1;
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