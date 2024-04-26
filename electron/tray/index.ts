import { app, Tray, Menu } from 'electron'
import path from "node:path";

// mac 分辨率高 最好使用 32*32
export function createTray (icon?: string) {
    let tray = new Tray(icon || path.join(app.getAppPath(), 'src/assets/tray/qy@2x.png'));

    const contextMenu = Menu.buildFromTemplate([
        { label: app.name },
        { label: '退出', click: () => app.quit() },
    ])

    tray.setContextMenu(contextMenu)
}
export default createTray;