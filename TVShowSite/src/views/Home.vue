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
  }
};
</script>
<template>
    <div id="app">
      <DailyQuote></DailyQuote>
      <SectionHeader></SectionHeader>
      <div class="flex-container">
        <div class="break"></div>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
        <SeriesContainer></SeriesContainer>
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
</style>