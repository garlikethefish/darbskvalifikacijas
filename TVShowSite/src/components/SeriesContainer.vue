<template>
    <div class="series-container">
        <img :src="getSeriesPictureUrl(series.series_picture)" alt="Series">
        <div class="card">{{ series.title }}</div>
        <div class="caption-text">{{ series.description.substring(0,100) + "..."  }}</div>
        <router-link to="reviews">
            <button class="hover-button">Review</button>
        </router-link>
        <button @click="openModal" class="modal-button">More</button>
        <div class="modal" v-if="isModalOpen" @click.self="closeModal">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h1>{{ series.title }}</h1>
                <p>{{ series.description }}</p>
                <p>Genre: {{ series.genre }}</p>
                <p>Released: {{ series.release_year }}</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            isModalOpen: false
        };
    },
    methods: {
        openModal() {
            this.isModalOpen = true;
        },
        closeModal() {
        this.isModalOpen = false;
        },
        getSeriesPictureUrl(filename) {
            if (!filename) {
                return new URL('../assets/series_images/basic_series.png', import.meta.url).href;
            }
            return new URL(`../assets/series_images/${filename}`, import.meta.url).href;
        }
    },
    props: {
    series: {
      type: Object,
      required: true
    }
  }
}
</script>