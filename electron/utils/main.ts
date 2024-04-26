import {app, nativeImage} from "electron";
import path, {join} from "node:path";

export function findIcon (name = "menu.png") {
    return nativeImage.createFromPath(app.getAppPath() + path.join(`/src/assets/image/${name}`)).resize({width: 16,height: 16})
}
