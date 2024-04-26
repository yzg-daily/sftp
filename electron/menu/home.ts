import {app, dialog, Menu, nativeImage, nativeTheme} from 'electron'

import {findIcon} from '../utils/main'

const isMac = process.platform === 'darwin'

const defineMenuIcon = findIcon();

function createMenu(win = null) {
    const menu = [
        {
            icon: findIcon('watermelon.png'),
            label: app.name,
            submenu: [
                {role: 'about', label: '关于', icon: defineMenuIcon},
                {
                    icon: defineMenuIcon,
                    label: '详情',
                    click: () => {
                        // const newWin = new BrowserWindow({
                        //     width: '80%',
                        //     height: '90%',
                        //     title: item.label,
                        //     autoHideMenuBar: true,
                        //     webPreferences: {
                        //         preload: path.join(__dirname, 'preload.js'),
                        //     },
                        // })
                        // newWin.loadFile('about.html')
                        // Menu.setApplicationMenu(null)
                    }
                },
                {
                    icon: findIcon("close.png"),
                    label: '退出',
                    click: async () => {
                        const res = await dialog.showMessageBox({
                            title: '退出提示',
                            type: 'warning',
                            buttons: ['取消', '确定'],
                            message: '学习唱跳rap',
                            checkboxLabel: '下次一定'
                        })
                        console.log(res)
                        if (res.response === 1) {
                            app.quit();
                        }
                    }
                },
                {
                    icon: findIcon("close.png"),
                    label: '退出1',
                    click: async (item, browserWindow) => {
                        browserWindow.webContents.send('quit-before', item.label)
                    }
                },
            ]
        },
        {
            icon: findIcon('watermelon.png'),
            label: '修改value',
            submenu: [

                {
                    icon: findIcon('plus-sign.png'),
                    label: 'value + 1',
                    click: (_, browserWindow) => {
                        browserWindow.webContents.send('update-current', 1)
                    }
                },
                {
                    icon: findIcon('plus-sign.png'),
                    label: 'value - 1',
                    click: (_, browserWindow) => {
                        browserWindow.webContents.send('update-current', -1)
                    }
                }
            ]
        },
        {
            icon: findIcon(),
            label: '切换主题',
            submenu: [
                {
                    icon: findIcon(),
                    label: '亮色',
                    click: () => {
                        nativeTheme.themeSource = 'light'
                    }
                },
                {
                    icon: findIcon(),
                    label: '深色',
                    click: () => {
                        nativeTheme.themeSource = 'dark'
                    }
                },
                {
                    icon: findIcon(),
                    label: '跟随系统',
                    click: () => {
                        nativeTheme.themeSource = 'system'
                    }
                },
            ]
        },
        {
            icon: findIcon('watermelon.png'),
            label: '菜单操作',
            submenu: [
                {

                    label: '开发者工具',
                    role: 'toggledevtools',
                    icon: findIcon("strawberry.png"),
                },
                {
                    icon: findIcon("folder.png"),
                    label: '选择文件',
                    accelerator: 'Ctrl+CommandOrCtrl+O',
                    click: async (item, browserWindow) => {
                        const file = dialog.showOpenDialogSync({
                            title: '选择文件',
                            filters: [
                                {name: 'Images', extensions: ['jpg', 'png', 'gif']}
                            ],
                            properties: ["openFile", "multiSelections", "createDirectory", "promptToCreate"]
                        })
                        if (file) {
                            browserWindow.webContents.send('select-file', file.map((path => ({
                                path,
                                src: nativeImage.createFromPath(path).toDataURL(),
                                file: nativeImage.createFromPath(path)
                            }))))
                        }
                    }
                },
                {
                    icon: defineMenuIcon,
                    label: '模拟QQ',
                    click: () => {

                        // const newWin =  new BrowserWindow({
                        //     width: '80%',
                        //     height: '90%',
                        //     title: 'QQ',
                        //     autoHideMenuBar: true,
                        //     webPreferences: {
                        //         nodeIntegration: false, // 禁用Node.js集成
                        //         contextIsolation: true, // 启用上下文隔离
                        //         preload: path.join(__dirname, 'preload.js'),
                        //     },
                        // })
                        // newWin.webContents.openDevTools()
                        // newWin.loadFile( app.getAppPath() + '/src/views/qq/qq.html')
                    }
                }
            ],
        }
    ]
    return Menu.setApplicationMenu(Menu.buildFromTemplate(menu as any[]))
}

export default createMenu