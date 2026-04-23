<template>
  <div class="section-header" :class="`section-header--${level}`">
    <component :is="level" class="section-header__title"><slot /></component>
    <div v-if="$slots.actions" class="section-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    level: {
      type: String,
      default: 'h2',
      validator: (v) => ['h1', 'h2'].includes(v)
    }
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* h1 variant — gradient divider (used in Home.vue) */
.section-header--h1 {
  padding-top: 30px;
  padding-bottom: 30px;
  background: var(--dark-bg-color);
  background: linear-gradient(180deg, var(--dark-bg-color) 33%, var(--background-color) 100%);
}

.section-header--h1 .section-header__title {
  margin: 0 auto;
  font-size: 26px;
  text-align: center;
}

/* h2 variant — accent border (used in Profile.vue, ReviewDetail.vue) */
.section-header--h2 {
  margin-bottom: 1.5rem;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--accent-color);
}

.section-header--h2 .section-header__title {
  color: var(--accent-color);
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .section-header--h2 {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
}
</style>