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
        <div class="right-container">
            <div class="top-section">
                <div class="rating">
                    <img class="star" :src="'./src/assets/star.png'">
                    <img class="star" :src="'./src/assets/star.png'">
                    <img class="star" :src="'./src/assets/star.png'">
                    <img class="star" :src="'./src/assets/star.png'">
                    <img class="star" :src="'./src/assets/star.png'">
                </div>
                <div class="user">
                    <h2>username</h2>
                    <h3>23 reviews</h3>
                </div>
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
    
    
}
.star{
    /* use greyscale filter for no star */
    min-width: 30px;
    max-width: 50px;
    height: auto;
}
.rating{
    display: flex;
    justify-content: center; 

}
.top-section{
    display: flex;
    align-items: center;
    text-align: center;
}
.top-section h2, h3{
    max-width: 20%;
}
.user{
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 20%;
}
.content-section{
    flex-direction: column;
    min-height: 300px;
}
.bottom-section{
    display: flex;
    align-items: center;
}
.bottom-section p{
    min-width: 20%;
}
.series-section{
    max-width: 400px;
    max-height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
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
</style>