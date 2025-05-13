<template>
    <div v-if="quote"> <!-- v-if so that doesnt display elements before quote data loaded-->
        <h1 >“{{ quote.quote }}”</h1>
        <h2>{{ quote.series_title }}: Season {{ quote.season }}, Episode {{ quote.episode }}</h2>
    </div>
</template>
<style scoped>
    div{
        padding-top: 5%;
        padding-bottom: 5%;
        background: linear-gradient(to right,var(--gradient-start),var(--medium-bg-color));
    }
    h1{
        font-style: italic;
    }
    h2{
        color:var(--accent-color);
        text-align: center;
        font-style: italic;
    }
</style>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      quote: null
    };
  },
  mounted() {
    axios.get('http://localhost:3000/api/daily-quote')
      .then(res => {
        this.quote = res.data;
      });
  }
};
</script>