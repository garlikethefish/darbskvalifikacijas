<template>
  <div class="review-container">
    <div class="series-section">
      <h1 class="series-title">{{ review.series_title || 'Series Title' }}</h1>
      <img class="square-img" :src="getEpisodePictureUrl(review.episode_picture)" alt="Episode image" />
      <h2 class="season-episode">{{ formatSeasonEpisode(review) }}</h2>
      <p class="avg">Average score: {{ Number(review.average_rating).toFixed(2) }} / 5</p>
      <div class="rating">
        <img
          v-for="n in 5"
          :key="n"
          class="star-avg"
          :src="n <= avgStars ? './src/assets/star.png' : './src/assets/star-empty.png'"
          alt="average show star rating"
        />
      </div>
    </div>

    <div class="right-container">
      <div class="top-section">
        <h2 class="series-title">{{ review.episode_title || 'Episode Title' }}</h2>
        <div class="rating">
          <img
            v-for="n in 5"
            :key="'user-star-' + n"
            class="star"
            :src="n <= review.rating ? './src/assets/star.png' : './src/assets/star-empty.png'"
            alt="user rating star"
          />
        </div>

        <div class="user-container">
          <div class="user">
            <h2>{{ review.username || 'username' }}</h2>
            <h3>{{ review.user_review_count || 0 }} reviews</h3>
          </div>
          <img
            class="pfp"
            :src="getProfilePictureUrl(review.profile_picture)"
            alt="User profile picture"
          />
        </div>
      </div>

      <div class="content-section">
        <h1>{{ review.review_title }}</h1>
        <p>{{ review.review_text }}</p>
      </div>

      <div class="bottom-section">
        <div class="date-container">
          <p class="date">{{ formatDate(review.date) }}</p>
        </div>

        <img class="small-icon" :src="'./src/assets/heart_icon.png'" alt="likes" />
        <p class="likes">{{ review.likes }}</p>

        <img class="small-icon" :src="'./src/assets/broken_hrt_icon.png'" alt="dislikes" />
        <p class="dislikes">{{ review.dislikes }}</p>

        <img class="small-icon" :src="'./src/assets/comment_icon.png'" alt="comments" />
        <p class="comments">{{ review.comment_count }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewPost',
  props: {
    review: {
      type: Object,
      required: true
    }
  },
  computed: {
    averageRating() {
      return Number(this.review.average_rating) || 0;
    },
    avgStars() {
      return Math.round(this.averageRating);
    }
  },
  methods: {
    getProfilePictureUrl(filename) {
      if (!filename) {
        return new URL('../assets/defaultpfp.jpg', import.meta.url).href;
      }
      return new URL(`../assets/user_pfp/${filename}`, import.meta.url).href;
    },
    getEpisodePictureUrl(filename) {
      if (!filename) {
        return new URL('../assets/series_images/basic_series.png', import.meta.url).href;
      }
      return new URL(`../assets/series_season_images/${filename}`, import.meta.url).href;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatSeasonEpisode(review) {
      const season = (review.season_number || 0).toString().padStart(2, '0');
      const episode = (review.episode_number || 0).toString().padStart(2, '0');
      return `${season}x${episode}`;
    }
  }
};
</script>



<style>
.pfp{
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    margin: 10px;
    margin-right: 40px;
}
.small-icon{
    width: 60px;
    height: 60px;
    margin: 10px;
}
.square-img{
    width: 200px;
    height: 200px;
    
    
}
.star{
    max-width: 50px;
    height: auto;
}
.star-avg{
    max-width: 30px;
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
.user h3, h2{
  margin: 2px;
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