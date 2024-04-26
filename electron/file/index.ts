import fs from 'node:fs/promises';
import path from "path";


// async function createMkDir(filePath: string = '/', fileName:string = '新建文件') {
//     if (!path) return false;
//     return new Promise((resolve, reject) => {
//         fs.mkdir(filePath, { recursive: true }, (err) => {
//             const res = {
//                 filePath, fileName,
//             }
//             if (err) {
//                 reject({...res, code: 0, err})
//             } else {
//                 resolve({...res, code: 1})
//             }
//         })
//     })
// }
export async function readyFile(filePath: string = '/') {
    if (!filePath) return false;
    try {
        const data = await fs.readFile(filePath, 'utf8')
        return JSON.parse(data)
    } catch (e) {
        return undefined;
    }
}
export async function saveFile(filePath: string = '/', fileContent = '', options) {
    console.log(fileContent, "fileContent");
    try {
        await fs.writeFile(filePath, fileContent, {
            encoding: 'utf8',
            ...options
        });
        console.log('File saved successfully!');
        return true;
    } catch (err) {
        console.error('Error saving file:', err);
        return false
    }
}