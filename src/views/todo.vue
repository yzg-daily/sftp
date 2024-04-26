<script setup lang="ts">
import {Plus, Delete} from '@element-plus/icons-vue'
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
const todoList = [
  {
    title: 'todotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodo',
    content: 'totodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotododo',
  },
  {
    title: 'todotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodo',
    content: 'totodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotodotododo',
  }
]
</script>

<template>
  <div class="page">
    <div class="mb-2">
      <el-button type="primary" :icon="Plus" circle />
    </div>
    <transition-group>
      <ul class="todo">
        <li class="mb-2 py-2 text flex items-center justify-between w-full overflow-hidden" v-for="el in todoList">
          <div class="w-full todo-title">
            <p class="title">
              <el-text truncated class="text-white text-2xl w-full">{{el.title}}</el-text>
            </p>
            <p class="content w-full overflow-hidden">{{el.content}}</p>
          </div>

          <div class="handle w-[30px]">
            <el-icon class="text-2xl"><Delete /></el-icon>
          </div>
        </li>
      </ul>
    </transition-group>

  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>