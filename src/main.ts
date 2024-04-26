import { createApp, type Directive } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import './utils/directive/index'
import 'animate.css';
import './demos/ipc'
import './css/style.css'
import './css/tailwind.scss'
import './css/index.scss'
import * as directives from "./utils/directive/index";
const app = createApp(App);
app.use(ElementPlus)
app.use(router)
// 自定义指令


Object.keys(directives).forEach(key => {
    app.directive(key, (directives as { [key: string]: Directive })[key]);
});



router.isReady().then(() => {
    app
        .mount("#app")
        .$nextTick(() => {
            postMessage({ payload: 'removeLoading' }, '*')
        })
});


