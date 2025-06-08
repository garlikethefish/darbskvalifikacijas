<template>
  <div>
    <h1 id="first-title">Reviews</h1>
    <div v-if="loading" class="load">
        <h2>Loading reviews...</h2>
    </div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ReviewPost
        v-for="review in reviews"
        :key="review.id"
        :review="review"
      />
    </div>
  </div>
</template>

<style>
.load{
    text-align: center;
}
</style>

<script>
import axios from 'axios'
import ReviewPost from '@/components/ReviewPost.vue'

export default {
  name: 'Reviews',
  components: { ReviewPost },
  data() {
    return {
      reviews: [],
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.loading = true;

    axios.get('/api/reviews')
      .then(res => {
        this.reviews = res.data.sort((a, b) => new Date(b.date) - new Date(a.date)); //sorts newest to oldest review by date
      })
      .catch(err => {
        console.error('Failed to load reviews:', err);
        this.error = 'Failed to load reviews.';
      })
      .finally(() => {
        this.loading = false;
      });
  },
};
</script>


