<template>
  <nav :class="['nav-links', { active: isMenuOpen }]">
    <router-link class="link" to="/reviews" @click="$emit('close')">Reviews</router-link>
    <router-link class="link" to="/about" @click="$emit('close')">About</router-link>
    <router-link class="link" to="/contact" @click="$emit('close')">Contact</router-link>
    <router-link class="link" to="/stats" @click="$emit('close')">Statistics</router-link>
  </nav>
</template>

<script>
export default {
  props: {
    isMenuOpen: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
.nav-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  transition: transform 0.3s ease;
}

.link {
  margin: 0 8px;
}

.link:hover {
  color: var(--text-color);
}

@media (max-width: 500px) {
    .nav-links a {
        margin: 10px 0;
        font-weight: bold;
        padding-left: 10px;
    }
    .nav-links {
        display: flex;
        position: absolute;
        top: 100px;
        left: -100%;
        width: 100%;
        gap: 0;
        background: linear-gradient(180deg, var(--dark-bg-color) 33%, var(--background-color) 100%);
        border-bottom: 2px solid var(--text-color);
        border-top: 2px solid var(--text-color);
        transition: left 0.3s ease;
        flex-direction: column;
        padding: 20px;
        box-sizing: border-box;
        z-index: 1000;
    }
    .link {
        margin: 10px 0;
        padding-left: 10px;
        color: var(--text-color);
    }

    .nav-links.active {
        left: 0;
    }
}
</style>
