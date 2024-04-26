<script setup lang="ts">
import sftp from './sftp.vue';
function goto(path = '/') {
  window.ipcRenderer.invoke('open-win', {
    path,
    id: path,
    title: '服务器信息',
    // frame: false, // Set frameless window
    // transparent: true // Set transparent window
    // backgroundColor: '#fff'
  })
}

const list = [
  { name: 'ftp', path: '/sftp'},
  { name: 'water', path: '/water'},
]

</script>

<template>
  <div class="drag">
    <sftp />
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>