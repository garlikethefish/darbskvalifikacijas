<template>
  <div @click="$emit('toggle')" class="hamburger-menu">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
    .hamburger-menu {
        display: none;
    }

    @media (max-width: 500px) {
    .hamburger-menu {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 35px;
    height: 30px;
    z-index: 1100;
    margin-left: 10px;
    }
    .hamburger-menu span {
    display: block;
    height: 3px;
    background-color: var(--text-color);
    border-radius: 2px;
    }
    }
</style>
