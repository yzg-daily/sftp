<script setup lang="ts">
import {CircleCloseFilled} from '@element-plus/icons-vue'
import useGetFile from '../hooks/useGetFile';
import qyCard from '../components/qyCard.vue';
import {reactive, Ref, ref, toRaw} from "vue";
import type {IpcRendererEvent} from 'electron'

interface Item {
  title?: string;
  derive?: string;
  username: string;
  password: string;
  location: string;
  catalogue?: string;
  port?: string;
  sftp?: string;// 使用ftp软件生成
  index?: number;// 索引
  [propName: string]: any;
}

interface Menu {
  label: string;
  code: string;
}

interface ContextMenu {
  menu: Menu[]
  channel: string;
  record: Item | undefined;
  type: string | undefined;
}

function encodeIfContainsAtSymbol(str: string) {
  if (str.includes('@')) {
    return encodeURIComponent(str);
  } else {
    return str;
  }
}

/**
 *
 * returned sftp://root:password@location:port/catalogue
 * returned sftp://root@location:port/catalogue
 * returned sftp://root@location:port
 * returned sftp://root:password;fingerprint=xxx@location:port // 这是 ftp 生成的url 用户+密码+密钥+ip+端口 （密钥应该直接能对应目录）
 * */
function filterText(el: Item, force = false) {
  const {sftp, username, password, location, port, catalogue} = el;
  if (sftp && !force) return sftp;
  let str = `sftp://${username}:${encodeIfContainsAtSymbol(password)}@${location}:${port}`
  if (catalogue) {
    str += `${catalogue}`
  }
  el.sftp = str;
  return str
}


const list = ref<Item[]>();

interface FileData {
  server: any[]
}

// async function getFile() {
//   const [fileData, loading]: [Ref<FileData | undefined>, Ref<boolean>] = await useGetFile("/serverJson/server.json");
//   if (loading.value) return false;
//   list.value = fileData.value?.server || [];
// }
//
// getFile();

async function getFile() {
 list.value = await window.ipcRenderer.invoke('store:get', 'ftp', []);
}
getFile();

async function saveFile (content: any) {
  console.log(content, 'saveFile');
  const res = await window.ipcRenderer.invoke('store:set', 'ftp', content);
  console.log(res);
}

const show = ref(false);

function mouseenter() {
  getFile()
  show.value = true
}

function mouseleave() {
  console.log('mouseleave');
  show.value = false;
}

/**
 * 添加编辑 组件化
 * */
const visible = ref(false);
const formValues: Item = reactive({
  title: '',
  username: 'root',
  password: '',
  location: '',
  port: '8080',
  catalogue: '',
  sftp: ''
})

function handleBlur (event: any) {
  const val = event.target.value;
  if (!val) return;
  if (val) {
    formValues.sftp = filterText(formValues, true)
  }
}


const keyName = {
  "title": "名称",
  "username": "用户名",
  "location": "IP",
  "port": "端口",
  "password": "密码",
  "catalogue": "部署目录",
}

function getText(obj: Item) {
  return Object.entries(keyName).reduce((cur, pre) => {
    const [key, value]: [any, string] = pre;
    cur += ` ${value}: ${obj[key]} \n`
    return cur;
  }, '')
}

function down(el: Item) {

  window.ipcRenderer.invoke(
      'dialog:save-file',
      {
        title: '保存',
        defaultPath: `${el.title}服务器信息`, // 文件名称
        filters: [{name: 'Text Files', extensions: ['txt']}], // 文件类型
      },
      getText(el)
  )
}
function allDown() {
  let txt = list.value?.reduce((acc, pre) => {
    acc += getText(pre);
    return acc;
  }, '');
  window.ipcRenderer.invoke(
      'dialog:save-file',
      {
        title: '保存',
        defaultPath: 'ftp账号密码',
        filters: [{name: 'Text Files', extensions: ['txt']}], // 文件类型
      },
      txt
  )
}

const contextMenu: ContextMenu = reactive({
  menu: [
    {label: '修改', code: 'sftp:edit'},
    {label: '复制', code: 'sftp:copy'},
    {label: '导出', code: 'sftp:derive'},
    {label: '删除', code: 'sftp:delete'}
  ],
  channel: 'sftp:right:menu',
  type: undefined,
  record: undefined,
})

function onRightClick(event: Event, record: Item, index: number) {
  event.preventDefault();
  contextMenu.record = {...record, index};
  window.ipcRenderer.send('right:click', toRaw(contextMenu))
}
const mainMenu = {
  menu: [
    {label: '导出', code: 'sftp:allDown'},
    {label: '退出', code: 'sftp:quit', role: 'quit'},
  ],
  channel: 'sftp:right:menu',
}

function handleRightClick(event: Event) {
  event.preventDefault();
  window.ipcRenderer.send('right:click', mainMenu)
}

window.ipcRenderer.on(contextMenu.channel, (event: IpcRendererEvent, code: string): void => {
  const record = contextMenu.record as Item;
  contextMenu.type = code;
  switch (code) {
    case 'sftp:allDown':
      allDown()
      break;
    case 'sftp:derive':
      down(record)
      break;
    case 'sftp:edit':
    case 'sftp:copy':
      Object.keys(formValues).forEach(el => {
        formValues[el] = record?.[el]
      })
      visible.value = true;
      break;
    case 'sftp:delete':
      list.value?.splice(record.index as number, 1);
      saveFile(toRaw(list.value))
      // window.ipcRenderer.invoke(
      //     'save-file',
      //     '/serverJson/server.json',
      //     JSON.stringify({server: toRaw(list.value)}),
      //     {
      //       flow: 'w'
      //     }
      // );
      visible.value = false;
      break;
  }
})


function handleClose() {
  visible.value = false;
}

const formRef = ref();


function handleAdd() {
  visible.value = true;
  formRef.value.validate((valid: boolean) => {
    if (!valid) return false;
    const index = contextMenu.record?.index;
    const type = contextMenu.type;
    if (index === undefined || type === 'sftp:copy') {
      list.value?.push(toRaw(formValues));
    } else {
      list.value?.splice(index, 1, {
        ...formValues
      })
    }
    console.log(list.value);
    saveFile(toRaw(list.value))
    // window.ipcRenderer.invoke(
    //     'save-file',
    //     '/serverJson/server.json',
    //     JSON.stringify({server: toRaw(list.value)}),
    //     {
    //       flow: 'w'
    //     }
    // );
    visible.value = false;
  })
}

</script>

<template>
  <div class="drag ">
    <div class="drag ">
      <qy-card class="group fixed  right-1.5 bottom-1.5" @mouseenter="mouseenter" @mouseleave="mouseleave">
        <transition @mouseenter.prevent>
          <ul @mouseenter.prevent class="server-list w-[50px] transition-all translate-y-[-8px]" v-show="show">
            <li is="qy-card" v-for="(el, index) in list" :key="el.location + index"
                @contextmenu="(event) => onRightClick(event, el, index)"
                class="icon-item  relative transition w-full h-full box p-2 mb-2">
              <a :href="filterText(el)" class="text-center block">
                <span class="transition scale-90 w-full h-full hover:scale-100"> {{ el.title }} </span>
                <!--              <img class="transition scale-90 w-full h-full hover:scale-100" src="../assets/image/pear.png" alt="">-->
              </a>
            </li>
            <li is="qy-card" class="icon-item  relative transition w-full h-full box p-2 mb-2" @click="visible = true"
                v-show="!visible">
              <img @mouseenter.prevent class="transition scale-90 w-full h-full hover:scale-100"
                   src="../assets/image/plus-sign.png" alt="">
            </li>
          </ul>
        </transition>
        <transition v-show="visible">
          <div is="qy-card" class="icon-item  relative transition w-[50px] h-[50px] box p-2 mb-2" @click="handleAdd">
            <img class="transition scale-90 w-full h-full hover:scale-100" src="../assets/image/save.png" alt="">
          </div>
        </transition>
        <div class="rounded-2xl h-[50px] w-[50px] p-2 bg-blue-600 relative z-10" @mouseenter.prevent
             @contextmenu="handleRightClick">
          <img src="../assets/image/sftp.png" alt="" class="w-full h-full">
        </div>
      </qy-card>
      <transition name="add">
        <qy-card v-show="visible" v-mouse class="transition-all add-form w-[350px] fixed right-[70px]  bottom-1.5">
          <div class="tools justify-end">
            <el-icon @click="handleClose" class="rounded-2xl">
              <CircleCloseFilled/>
            </el-icon>
          </div>
          <el-form class="px-4" :model="formValues" ref="formRef">
            <el-form-item class="s-item bg-transparent">
              <el-input type="textarea" rows="3" placeholder="sftp" v-model.trim="formValues.sftp"/>
            </el-form-item>
            <el-form-item class="s-item">
              <el-input placeholder="服务器名称" v-model="formValues.title"></el-input>
            </el-form-item>
            <el-form-item class="s-item">
              <el-input placeholder="用户" v-model="formValues.username"></el-input>
            </el-form-item>
            <el-form-item class="s-item">
              <el-input placeholder="密码" v-model="formValues.password" @blur="handleBlur"></el-input>
            </el-form-item>
            <el-form-item class="s-item">
              <el-input placeholder="IP" v-model="formValues.location"></el-input>
            </el-form-item>
            <el-form-item class="s-item">
              <el-input placeholder="端口" v-model="formValues.port"></el-input>
            </el-form-item>
            <el-form-item class="s-item">
              <el-input placeholder="部署目录(不要root,路径/x/x/x)" v-model="formValues.catalogue"></el-input>
            </el-form-item>
          </el-form>
        </qy-card>
      </transition>
    </div>

  </div>

</template>

<style scoped>
.add-form {
  width: 300px;
  backdrop-filter: blur(10px);
  background-color: rgba(65, 65, 65, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  z-index: 1;

  .tools {
    display: flex;
    align-items: center;
    padding: 9px;
  }
}

.v-enter-active,
.v-leave-active {

  animation: slideUp .3s ease-in forwards;
}

.v-enter-from,
.v-leave-to {
  animation: slideDown .3s;
}

.add-enter-active,
.add-leave-active {
  transform: translateX(50px);
}

.add-enter-from,
.add-leave-to {
  transform: translateX(0);
}

.slideUp {
  -webkit-animation-name: slideUp;
  animation-name: slideUp;
}

@keyframes slideUp {
  0% {
    transform-origin: 0 0;
    transform: translateY(0%);
  }

  100% {
    transform-origin: 0 0;
    transform: translateY(-8px);
    opacity: 1;
  }
}

.slideDown {
  -webkit-animation-name: slideDown;
  animation-name: slideDown;
}

@keyframes slideDown {
  0% {
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: translateY(0%);
    transform: translateY(0%);
  }
  10% {
    transform: translateY(10%);
    opacity: .6;
  }
  25% {
    transform: translateY(20%);
    opacity: .2;
  }
  40% {
    transform: translateY(30%);
    opacity: 0;
  }
  100% {
    opacity: 0;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
}

</style>
