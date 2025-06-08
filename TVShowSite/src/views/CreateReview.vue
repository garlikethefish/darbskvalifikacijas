<template>
  <div id="app">
    <div class="create-review">
      <h1>Create new review</h1>

      <div class="form-section">
        <label>Select TV show:</label>
        <div class="series-list">
          <div
            class="series-item"
            v-for="series in seriesList"
            :key="series.id"
            @click="selectSeries(series)"
            :class="{ selected: selectedSeries?.id === series.id }"
          >
            <img :src="getSeriesPictureUrl(series.series_picture)" />
            <p>{{ series.title }}</p>
          </div>
        </div>
      </div>

      <div class="form-section" v-if="selectedSeries">
        <label>Select Episode</label>
        <div class="episode-list">
          <div
            class="episode-item"
            v-for="episode in episodes"
            :key="episode.id"
            @click="selectEpisode(episode)"
            :class="{ selected: selectedEpisode?.id === episode.id }"
          >
            <img :src="getEpisodePictureUrl(episode.picture)" />
            <p>{{ episode.title }}</p>
          </div>
        </div>
      </div>

      <div class="form-section" v-if="selectedEpisode">
        <label>Review Title</label>
        <input type="text" v-model="review.title" />

        <label>Description</label>
        <textarea v-model="review.description"></textarea>

        <label>Rating (1-5)</label>
        <input type="number" v-model.number="review.rating" min="1" max="5" />

        <button @click="submitReview">Post Review</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CreateReview",
  data() {
    return {
      seriesList: [],
      selectedSeries: null,
      episodes: [],
      selectedEpisode: null,
      review: {
        title: "",
        description: "",
        rating: 5,
      },
    };
  },
  mounted() {
    this.fetchSeries();
  },
  methods: {
    async fetchSeries() {
        const res = await fetch("http://localhost:3000/api/series");
        const data = await res.json();
        // sort alphabetically by title
        this.seriesList = data.sort((a, b) =>
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );
    },
    async selectSeries(series) {
      this.selectedSeries = series;
      this.selectedEpisode = null;
      const res = await fetch(
        `http://localhost:3000/api/episodes?seriesId=${series.id}`
      );
      const data = await res.json();
      this.episodes = data;
    },
    getSeriesPictureUrl(filename) {
      if (!filename) {
        return new URL(
          "../assets/series_images/basic_series.png",
          import.meta.url
        ).href;
      }
      return new URL(`../assets/series_images/${filename}`, import.meta.url).href;
    },
    getEpisodePictureUrl(filename) {
      if (!filename) {
        return new URL(
          "../assets/series_images/basic_series.png",
          import.meta.url
        ).href;
      }
      return new URL(`../assets/series_season_images/${filename}`, import.meta.url).href;
    },
    selectEpisode(episode) {
      this.selectedEpisode = episode;
    },
    async submitReview() {
      const user = JSON.parse(localStorage.getItem("auth"))?.user;
      if (!user || !this.selectedEpisode) return;

      const payload = {
        user_id: user.id,
        episode_id: this.selectedEpisode.id,
        rating: this.review.rating,
        review_title: this.review.title,
        review_text: this.review.description,
      };

      const res = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + err.error);
        return;
      }

      alert("Review posted!");
      this.$router.push("/profile");
    },
  },
};
</script>

<style scoped>
.create-review {
  padding: 30px;
  max-width: 800px;
  margin: auto;
}

.form-section {
  background-color: var(--dark-bg-color);
  margin-bottom: 30px;
  padding: 20px;
  width: auto;
}

.series-list,
.episode-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.series-item,
.episode-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: large;
  background-color: var(--background-color);
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px;
  width: fit-content;
}
.series-item p,
.episode-item p {
    text-align: left;
}

.series-item.selected,
.episode-item.selected {
  border-color: #0077ff;
  background-color: rgba(0, 119, 255, 0.1);
}

.series-item img,
.episode-item img {
  width: 300px;
  height: auto;
  object-fit: cover;
  border-radius: 15px;
  border: solid;
  border-width: 5px;
  border-color: var(--dark-bg-color);
}

input,
textarea {
  width: 100%;
  padding: 10px;
  margin: 8px 0 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background: #1e8a54;
  color: white;
  padding: 12px 20px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #2cac56;
}
</style>
