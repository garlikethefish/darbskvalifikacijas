<template>
    <div v-if="quote"> <!-- v-if so that doesnt display elements before quote data loaded-->
        <h1 >“{{ quote.text }}”</h1>
        <h2>- {{ quote.series}}</h2>
    </div>
</template>
<style scoped>
    div{
        padding-top: 2%;
        padding-bottom: 2%;
        background: linear-gradient(to right,var(--gradient-start),var(--medium-bg-color));
    }
    h1{
        font-style: italic;
        font-size: 26px;
    }
    h2{
        font-size: 20px;
        color:var(--accent-color);
        text-align: center;
        font-style: italic;
    }
    @media (max-width: 500px) {
      h1{
        font-size: 18px;
        padding: 0 5px;
      }
      h2{
        font-size: 16px;
        padding: 0 5px;
      }
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
    axios.get('api/daily-quote')
      .then(res => {
        this.quote = res.data;
      });
  }
};
</script>