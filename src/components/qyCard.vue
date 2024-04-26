<script setup lang="ts">
  function mouseenter() {
    window.ipcRenderer.send('card:mouseenter');
  }
  function mouseleave() {
    window.ipcRenderer.send('card:mouseleave');
  }
</script>

<template>
  <div  @mouseenter="mouseenter" @mouseleave="mouseleave">
    <slot @mouseenter.prevent></slot>
  </div>
</template>

<style scoped>

</style>