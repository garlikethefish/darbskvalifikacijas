<script>
import Aside from '@/components/Aside.vue';
import SectionHeader from '@/components/SectionHeader.vue';
export default {
name: 'Premium',
  components: {
    Aside,
    SectionHeader
  }
};
</script>
<template>
    <div id="app">
        <Aside>Premium features!!!! Buy for 2.99!!!</Aside>
        <SectionHeader>{{ "" }}</SectionHeader>
        <div class="center">
            <div class="center-img">
                <img :src="'./src/assets/confetti.gif'">
                <img class="premium-img" :src="'./src/assets/premiumcat.png'">
                <img :src="'./src/assets/confetti.gif'">
            </div>
        </div>
        <p>Experience freedom. Not financial freedom though. Opposite of that acutally.</p>
    
    </div>
</template>
<style>
.center-img {
    
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
}
.premium-img {
    max-width: 800px;
}
</style>