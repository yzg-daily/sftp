import { app, BrowserWindow, shell, ipcMain, Menu, clipboard, dialog, screen } from 'electron'
import Store from 'electron-store'
import { createRequire } from 'node:module'
import log from 'electron-log'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

import {readyFile, saveFile} from "../file";
import {createTray} from '../tray'

const mainStore = new Store();

app.setLoginItemSettings({
  openAtLogin: true
});


process.on('uncaughtException', (error, origin) => {
  log.error('An uncaught exception occurred:', error);
  log.error('Origin:', origin);
  // 在这里可以添加其他错误处理逻辑，比如发送崩溃报告等
});
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 在这里可以添加其他错误处理逻辑
});


const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
globalThis.__filename = fileURLToPath(import.meta.url)
globalThis.__dirname = path.dirname(__filename)
process.env.APP_ROOT = path.join(__dirname, '../..')
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL



process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')
async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  console.log(width, height, 'width, height');
  win = new BrowserWindow({
    title: app.name,
    type: 'toolbar',
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#2f3241',
    //   symbolColor: '#74b1be',
    //   height: 30
    // },
    width: 400,
    height: height - 20,
    y: 0,
    x: width - 420,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    // icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })
  createTray()
  if (VITE_DEV_SERVER_URL) { // #298
    await win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    await win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
  win.setIgnoreMouseEvents(true, { forward: true });
  ipcMain.on('card:mouseenter', () => {
    win.setIgnoreMouseEvents(false);
  });
  ipcMain.on('card:mouseleave', () => {
    win.setIgnoreMouseEvents(true, { forward: true });
  });

  return win;
}

app.whenReady().then(() => {
  log.info('app ready')
  log.transports.file['file'] = `${app.getPath('userData')}/logs/app.log`;
  createWindow();
  Menu.setApplicationMenu(null)
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const {path: argRouterPath, ...option} = arg;
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      // nodeIntegration: true,
      // contextIsolation: false,
    },
    ...option
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${argRouterPath}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: argRouterPath })
  }
})
ipcMain.handle('ready-file', async (event, readyFilePath) => {
  return readyFile(path.join(process.env.VITE_PUBLIC, readyFilePath))
})
ipcMain.handle('save-file', async (event, saveFilePath, fileContent, option) => {
  return saveFile(path.join(process.env.VITE_PUBLIC, saveFilePath), fileContent, option)
})
// mainStore 读取数据
ipcMain.handle('store:get', (event, key, initData = undefined) => {
  if (!key) return mainStore.store;
  return mainStore.get(key) ?? initData;
})
// mainStore 存储数据, 根据key操作: 1 覆盖原来的， 2 追加 3 修改某条数据
ipcMain.handle('store:set', (event, key, value, type) => {
  // if ()
  console.log(value, 'store:set');
  /**
   *  type
   * 'r' - 读取模式：打开文件进行读取。如果文件不存在，则新建。
   * 'w' - 写入模式：打开文件进行写入。如果文件已存在，其内容将被覆盖；如果文件不存在，则创建新文件。
   * 'a' - 追加模式：打开文件并在文件末尾追加内容。如果文件不存在，则创建新文件。
   * 'r+' - 读写模式：打开文件进行读写。文件必须存在。
   * 'w+' - 读写模式（覆盖）：打开文件进行读写。如果文件已存在，内容将被覆盖；如果文件不存在，则创建新文件。
   * 'a+' - 读写模式（追加）：打开文件进行读写。文件的原有内容会被保留，写操作将在文件末尾追加内容。如果文件不存在，则创建新文件
   * */
  switch (type) {
    case 'a':
      const oldStore =  (mainStore.get(key) ?? {}) as object
      return mainStore.set(key, {...oldStore, ...value});
    default:
      return mainStore.set(key, value);
  }
})

ipcMain.on('copy-to-clipboard', (event, text) => {
  console.log('copy-to-clipboard', text);
  clipboard.writeHTML(text);
})
ipcMain.handle('dialog:save-file', async (event, options, text) => {
  try {
    const result = await dialog.showSaveDialog(null, options);

    if (result.canceled) {
      return false;
    }
    return await saveFile(result.filePath, text)
  } catch (e) {
    console.log("dialog:save-file", e);
    return false;
  }
})
ipcMain.on('right:click', (event, option) => {
  const {menu, channel = 'right:click:cb'} = option;
  menu.forEach((el) => {
    el.click = (item, brower) => {
      brower.webContents.send(channel, item.code)
    }
  })
  let contextMenu = new Menu();
  contextMenu = Menu.buildFromTemplate(menu);
  contextMenu.popup({
    window: win
  });
  // clipboard.writeHTML(text);
})
