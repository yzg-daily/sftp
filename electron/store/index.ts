
// 监听渲染进程保存数据的请求
// ipcMain.handle('save-data', async (event, storeName, data) => {
//     try {
//         // 保存数据
//         store.set(storeName, data);
//         return 'Data saved successfully.';
//     } catch (error) {
//         console.error('Error saving data:', error);
//         return 'Error saving data.';
//     }
// });

// 监听渲染进程读取数据的请求
// ipcMain.handle('load-data', async (event, storeName) => {
//     try {
//         // 加载数据
//         const data = store.get(storeName);
//         return data || 'No data found.';
//     } catch (error) {
//         console.error('Error loading data:', error);
//         return 'Error loading data.';
//     }
// });
