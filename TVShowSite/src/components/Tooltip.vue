<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="custom-tooltip"
      :style="tooltipStyle"
      role="tooltip"
    >
      <slot />
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'Tooltip',
  props: {
    show: { type: Boolean, default: false },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  computed: {
    visible() {
      return this.show;
    },
    tooltipStyle() {
      return {
        position: 'fixed',
        left: this.x + 'px',
        top: this.y + 'px',
        zIndex: 99999,
        pointerEvents: 'auto'
      };
    }
  }
};
</script>

<style>
.custom-tooltip {
  min-width: 180px;
  max-width: 260px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.98);
  border: 2px solid var(--accent-color, #70e974);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.5;
  box-shadow: 0 12px 32px 4px rgba(0,0,0,0.55), 0 0 0 2px var(--accent-color, #70e974);
  white-space: normal;
  text-align: center;
  opacity: 1;
  transition: opacity 0.18s;
  pointer-events: auto;
  user-select: text;
}
</style>
