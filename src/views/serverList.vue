<script setup lang="ts">
import {ref, toRaw} from "vue";
import {Edit, Bottom, CopyDocument} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

interface List {
  title: string
  name: string
  password: string
  location: string
  catalogue?: string
  port?: string
}

const keyName = {
  "title": "名称",
  "name": "用户名",
  "location": "IP",
  "port": "端口",
  "password": "密码",
  "catalogue": "部署目录",
}
const list = ref<List[]>([])
async function readyFile() {
  const data = await window.ipcRenderer.invoke('ready-file', "/serverJson/server1.json");
  list.value = (data?.server || []) as List[];
}

readyFile();

function getText(obj: any) {
  return Object.entries(keyName).reduce((cur, pre) => {
    const [key, value]: [any, string] = pre;
    cur += ` ${value}: ${obj[key]} \n`
    return cur;
  }, '')
}

async function down(el: List) {
  const text = getText(el);
  const options = {
    title: 'Save File',
    defaultPath: '服务器信息.txt',
    filters: [{name: 'Text Files', extensions: ['txt']}],
  };
  const res = await window.ipcRenderer.invoke('dialog:save-file', options, text)
  console.log(res);
}

function copyText(text: List | string, key = '') {
  window.ipcRenderer.send('copy-to-clipboard', key === 'all' ? JSON.stringify(toRaw(text)) : text);
  ElMessage.success(`${key} Copy successfully`);
}

const listItem = [
  {key: 'title', type: 'string', defineText: '-',},
  {key: 'location', type: 'string', defineText: '-'},
  {key: 'port', type: 'string', defineText: '-'},
  {key: 'catalogue', type: 'string', defineText: '-'},
]
</script>

<template>
  <div class="h-full w-full overflow-hidden server-list bg-opacity-50" draggable="true">
    <div class="h-full p-3 rounded">
      <el-empty v-if="!list || !list.length" description="暂无数据"/>
      <div v-else class="h-full w-full overflow-hidden">
        <div class="p-2">
          <el-button type="primary" :icon="Edit" circle/>
        </div>
        <el-scrollbar>
          <ul>
            <li class="group mb-2" v-for="(el, index) in list" :key="el.title + index">
              <div class="inline-flex rounded-xl p-2 bg-gray-700 transition-all">
                <img class="w-[35px] h-[35px] mr-[10px] " src="../assets/image/pear.png" alt="">
                <div>
                  <!--                  @click="copyText(el[keyName.key] as string, keyName.key)"-->
                  <div class="mb-1 text-sm flex items-center justify-between" v-for="keyName in listItem"
                       :key="keyName.key">
                    <!--                    <span class="hover:text-emerald-300">{{el[keyName.keyName] as string}}</span>-->
                    <div>
                      <el-icon class="ml-1.5 text hover:text-blue-500" v-if="keyName.key === 'title'">
                        <CopyDocument @click.stop="copyText(el, 'all')"/>
                      </el-icon>
                      <el-icon class="ml-1.5 text hover:text-blue-200" v-if="keyName.key === 'title'">
                        <el-icon @click.stop="down(el)">
                          <Bottom/>
                        </el-icon>
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>