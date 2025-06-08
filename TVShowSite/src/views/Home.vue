<script>
import axios from 'axios';
import Caption from '@/components/Caption.vue';
import DailyQuote from '@/components/DailyQuote.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import SeriesContainer from '@/components/SeriesContainer.vue';
import Aside from '@/components/Aside.vue';
export default {
  name: 'Home',
  components: {
    DailyQuote,
    Caption,
    SectionHeader,
    SeriesContainer,
    Aside
  },
  data() {
    return {
      series: [],
      error: null,
      loading: false
    };
  },
  methods: { 
    shuffleSeries(series) { //shuffle series
      return series
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }
  },
  mounted() {
    this.loading = true;

    axios.get('/api/series')
      .then(res => {
        this.series = this.shuffleSeries(res.data);
      })
      .catch(err => {
        console.error('Failed to load series:', err);
        this.error = 'Failed to load series.';
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>
<template>
    <div id="app">
      <DailyQuote></DailyQuote>
      <SectionHeader></SectionHeader>
      <div class="flex-container">
        <div class="break"></div>
        <div v-if="loading" class="load">
          <h2>Loading series...</h2>
        </div>
        <div v-else-if="error">{{ error }}</div>
        <SeriesContainer v-else v-for="one_series in series" :key="one_series.id" :series="one_series"/>
        <div class="break"></div>
      </div>
      <SectionHeader>{{ "" }}</SectionHeader> <!-- blank text -->
      <Aside></Aside>
    </div>
</template>
<style>
.break {
  margin-bottom: 40px;
}
.flex-container{
  justify-content: center;
  justify-items: center;
  align-items: center;
}
</style>