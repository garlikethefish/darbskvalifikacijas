<template>
    <div class="series-container">
        <img :src="'./src/assets/series_images/basic_series.png'" alt="Series">
        <div class="card">Series Title</div>
        <div class="caption-text">Basic series description with a lot of text like a lot a hell of a lot of text juppp jp jup.</div>
        <a href="reviews.html">
            <button class="hover-button">Review</button>
        </a>
        <button class="modal-button" data-target="modal1">More</button>
        <div id="modal1" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h1>Batman: The Animated Series</h1>
                <p>The Caped Crusader struggles to overcome his demons while battling Gotham's most notorious villains, including the Joker, Penguin and Harley Quinn.</p>
                <p>Seasons: 2</p>
                <p>Episodes: 85</p>
                <p>Created by: Eric Radomski, Bruce W. Timm</p>
                <p>Released: 1992</p>
            </div>
        </div>
    </div>
</template>