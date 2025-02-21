<template>
    <div class="review-container">
        <div class="series-section">
            <h1 class="series-title">Series Title</h1>
            <img class="square-img" :src="'./src/assets/gator.png'">
            <h2 class="season-episode">01x05</h2>
            <p class="avg">average score</p>
            <div class="rating">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
            </div>
        </div>
        <div class="top-section">
            <div class="rating">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
                <img class="star" :src="'./src/assets/star.png'">
            </div>
            <h2>username</h2>
            <h3>23 reviews</h3>
            <img class="pfp" :src="'./src/assets/pfp.png'">
        </div>
        <div class="content-section">
            <h1>the best show ever</h1>
            <p>this is the best thign ive ever seen 10/10 love it so much. wil never stop watching</p>
        </div>
        <div class="bottom-section">
            <p class="date">23-04-2025</p>
            <img class="pfp" :src="'./src/assets/pfp.png'">
            <p class="likes">834</p>
            <img class="pfp" :src="'./src/assets/pfp.png'">
            <p class="dislikes">200</p>
            <img class="pfp" :src="'./src/assets/pfp.png'">
            <p class="comments">12</p>
        </div>
    </div>
</template>
<style>
.pfp{
    width: 80px;
    height: 80px;
}
.square-img{
    width: 200px;
    height: 200px;
    object-fit: fill;
}
.star{
    /* use greyscale filter for no star */
    min-width: 30px;
    height: auto;
}
.rating{
    display: flex;
    justify-content: center; 

}
.review-container{
    background-color: var(--dark-bg-color);
    border-radius: 8px;
    color:var(--text-color);
    min-width: 400px;
    min-height: 500px;
    margin: 10px;
    display: flex;
    z-index: 1; 
    pointer-events: none; 
}
/* .series-section{

}
.top-section{

} */
</style>