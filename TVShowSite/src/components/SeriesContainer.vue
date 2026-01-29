<template>
  <div class="series-container">
    <img :src="getSeriesPictureUrl(series.series_picture)" alt="Series">
    <div class="card">{{ series.title }}</div>
    <div class="caption-text">{{ series.description?.substring(0, 100) + '...' }}</div>

    <router-link :to="`/create-review?seriesId=${series.id}`">
      <button class="hover-button">Review</button>
    </router-link>

    <router-link :to="`/series/${series.id}`">
      <button class="modal-button">More</button>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    series: { type: Object, required: true }
  },
  data() {
    return {};
  },
  methods: {
    getSeriesPictureUrl(path) {
      if (!path) return new URL('../assets/series_images/basic_series.png', import.meta.url).href;
      return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
    }
  }
};
</script>
<style>
.modal-button{
    position: absolute;
    top: 50px;
    right: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-color);
    background-color: var(--background-color);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease; 
    z-index: 2;
}
.series-container {
    position: relative;
    display: inline-block;
    width: 100%; 
    margin: 20px;
    overflow: hidden;
    text-align: center;
}

.series-container img {
    display: block;
    transition: filter 0.3s ease; 
    width: 100%;
    object-fit: cover;
    height: 250px;
}

@media (max-width: 500px){
.series-container{
    position: relative;
    display: inline-block;
    width: 100%; 
    margin: 20px;
    overflow: hidden;
    text-align: center;
}
.series-container img {
    display: block;
    transition: filter 0.3s ease; 
    width: 100%;
    object-fit: cover;
    height: 250px;
}
.modal-button{
    position: absolute;
    top: 50px;
    right: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-color);
    background-color: var(--background-color);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease; 
    z-index: 2;
}

.modal {
    position: fixed;
    z-index: 100; 
    left: 0;
    top: 0;
    width: 100%;
    overflow: auto; 
    background-color: rgba(0,0,0,0.4); 
  }
  

  .modal-content {
    background-color: var(--background-color);
    color: var(--text-color);
    margin: auto; 
    border: 1px solid #a9b6a8;
    width: 100%; 
    height: auto;
    font-size: 14px;
    font-weight: 500;
  }
  

  .close {
    color: var(--text-color);
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .close:hover,
  .close:focus {
    color: var(--light-bg-color);
    text-decoration: none;
    cursor: pointer;
}
.season-list {
  margin-top: 15px;
}

.season {
  background: var(--dark-bg-color);
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.season-header {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: var(--accent-color);
}

.episode-list {
  list-style: none;
  padding-left: 15px;
}

.episode {
  padding: 3px 0;
  display: flex;
  gap: 6px;
  font-size: 0.95rem;
}

.ep-number {
  font-weight: bold;
  color: var(--text-color);
}

.ep-name {
  flex: 1;
  color: var(--text-color);
}

.ep-date {
  color: var(--subtitle-color);
  font-style: italic;
  font-size: 0.85rem;
}
}
</style>