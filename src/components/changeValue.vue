<script setup lang="ts">
  import {ref} from "vue";
  import type { IpcRendererEvent } from 'electron'


  const num = ref(0)
  window.ipcRenderer.on('update-current', (event: IpcRendererEvent, value: number) => {
    console.log(value);
    num.value += value;
  })
</script>

<template>
  <div>{{num}}</div>
</template>

<style scoped>

</style>