import { app, Tray, Menu } from 'electron'
import path from "node:path";
import log from 'electron-log'
// mac 分辨率高 最好使用 32*32
export function createTray (icon?: string) {

    log.info(`createTray: ${path.join(__dirname, '../../dist/icon/32x32.png')}`)
    let tray = new Tray(icon || path.join(__dirname, '../../dist/icon/32x32.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: app.name },
        { label: '退出', click: () => app.quit() },
    ])

    tray.setContextMenu(contextMenu)
}
export default createTray;