<template>
  <teleport to="body">
    <transition name="custom-tooltip-fade">
      <div
        v-if="visible && modal"
        class="custom-tooltip-backdrop"
        @click.self="$emit('backdrop')"
      >
        <div
          class="custom-tooltip custom-tooltip-modal"
          role="alertdialog"
          aria-modal="true"
        >
          <slot />
        </div>
      </div>
    </transition>
    <div
      v-if="visible && !modal"
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
    y: { type: Number, default: 0 },
    modal: { type: Boolean, default: false }
  },
  emits: ['backdrop'],
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
  background: var(--tooltip-bg, rgba(0, 0, 0, 0.98));
  border: 2px solid var(--accent-color, #70e974);
  color: var(--tooltip-text, #fff);
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.5;
  box-shadow: 0 12px 32px 4px var(--shadow-color-strong, rgba(0,0,0,0.55)), 0 0 0 2px var(--accent-color, #70e974);
  white-space: normal;
  text-align: center;
  opacity: 1;
  transition: opacity 0.18s;
  pointer-events: auto;
  user-select: text;
}

.custom-tooltip-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.custom-tooltip-modal {
  width: min(420px, 100%);
  max-width: min(420px, calc(100vw - 32px));
  min-width: 0;
  padding: clamp(20px, 3.4vw, 28px);
  border-radius: 14px;
  text-align: center;
  font-size: clamp(0.9rem, 2vw, 1rem);
  line-height: 1.48;
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.7),
    0 0 0 2px var(--accent-color, #70e974),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.custom-tooltip-fade-enter-active,
.custom-tooltip-fade-leave-active {
  transition: opacity 0.18s ease;
}

.custom-tooltip-fade-enter-from,
.custom-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
