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
                <div class="user-container">
                    <div class="user">
                        <h2>username</h2>
                        <h3>23 reviews</h3>
                    </div>
                        <img class="pfp" :src="'./src/assets/pfp.png'">
                </div>
            </div>
            <div class="content-section">
                <h1>the best show ever</h1>
                <p>"The Alligator Chronicles" is an"The Alligator Chronicles" is an exciting and educational show that delves into the mysterious and fascinating world of alligators. From the very first episode, viewers are transported to the swamps, rivers, and wetlands where these incredible creatures thrive. The show does a great job of blending adventure with scientific insight, offering an in-depth look at the life cycle, behavior, and environmental importance of alligators. Whether you are a wildlife enthusiast or simply curious about these apex predators, the show provides a captivating blend of both entertainment and education.

The cinematography is one of the standout features of "The Alligator Chronicles." The breathtaking shots of alligators in their natural habitats are truly spectacular, showcasing not just the animals but the beautiful ecosystems they inhabit. From the murky waters to the sun-dappled swamps, the show does an excellent job of capturing the beauty and danger of the wild. The use of drones and underwater cameras allows viewers to see these reptiles from angles that are both thrilling and informative, providing an intimate look at their behavior.

The narrative is skillfully crafted, featuring stories about individual alligators and their unique experiences. From tracking the life of a young hatchling to exploring the territorial battles of mature adults, the show offers a detailed, personal view of the creatures. The pacing of each episode keeps things dynamic, as the audience is constantly learning something new about the alligator’s survival tactics, hunting strategies, and interactions with other wildlife. The inclusion of expert commentary and interviews with biologists helps provide context and expert analysis, making the show both entertaining and scientifically sound.

Another strength of the series is its exploration of conservation efforts. It highlights how alligators, once on the brink of extinction, have made a remarkable comeback thanks to dedicated efforts from wildlife agencies and scientists. The show emphasizes the importance of preserving these apex predators, not only for ecological balance but also for their cultural significance in various regions. It sheds light on the ongoing efforts to protect alligator habitats, reduce human-wildlife conflict, and ensure these remarkable creatures continue to thrive for generations to come.

While the show is undeniably informative, it also carries a sense of adventure and suspense. The combination of stunning visuals, real-life footage, and captivating storytelling creates a truly immersive experience. Whether it’s watching an alligator hunt its prey or observing its survival instincts in action, "The Alligator Chronicles" captures the essence of the wild in a way that feels both educational and thrilling. For anyone interested in wildlife, nature, or simply looking for an enthralling watch, this show is definitely worth checking out. </p>
            </div>
            <div class="bottom-section">
                <div class="date-container">
                    <p class="date">23-04-2025</p>
                </div>
                
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
    margin: 10px;
    margin-right: 40px;
}
.square-img{
    width: 200px;
    height: 200px;
    
    
}
.star{
    /* use greyscale filter for no star */
    max-width: 50px;
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
.user{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin:5px;
    width: auto;
}
.user-container{
    display: flex;
    align-items: center;
    justify-content: right;
    flex-direction: row;
}
.content-section{
    display: flex;
    flex-direction: column;
    min-height: 100px;
    margin-right: 10%;
    margin-bottom: 20px;
    box-sizing: border-box;
    align-self: center;
    overflow: auto;
    text-overflow: ellipsis;
    max-width: 1000px;
}
.content-section p{
    font-size: 22px;
}
.bottom-section{
    display: flex;
    align-items: flex-end;
    justify-content: right;
    flex:1;
}
.bottom-section p{
    min-width: 0;
    width: 10%;
}
.date-container{
    display: flex;
    justify-content: left;
}
.date-container p {
    width: 20%;
}
.series-section{
    max-width: 300px;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.series-section p,h1{
    min-width: 0;
    padding: 0;
}
.right-container{
    display: flex;
    flex-direction: column;
    max-height: 700px;
}
.review-container{
    display: flex;
    
    background-color: var(--dark-bg-color);
    border-radius: 8px;
    color:var(--text-color);
    max-height: 600px;
    max-width: fit-content;
    padding-top: 10px;
    padding-bottom: 10px;
    width: auto;
    margin: auto;
    margin-top: 20px;
    margin-bottom: 50px;
}
</style>