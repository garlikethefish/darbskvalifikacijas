<template>
  <button
    type="button"
    class="hamburger-menu"
    :class="{ open: isOpen }"
    :aria-expanded="isOpen ? 'true' : 'false'"
    aria-label="Toggle navigation menu"
    @click.stop="$emit('toggle')"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.hamburger-menu {
  display: none;
}

@media (max-width: 768px) {
  .hamburger-menu {
    align-items: center;
    background: var(--glass-bg-soft);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 5px;
    height: 42px;
    justify-content: center;
    left: 12px;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 42px;
    z-index: 1100;
  }

  .hamburger-menu span {
    background-color: currentColor;
    border-radius: 2px;
    display: block;
    flex-shrink: 0;
    height: 3px;
    transition: transform 0.25s ease, opacity 0.2s ease;
    width: 22px;
  }

  .hamburger-menu.open span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .hamburger-menu.open span:nth-child(2) {
    opacity: 0;
  }

  .hamburger-menu.open span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}
</style>
