import type { Directive } from "vue";

function mouseenterHandler(event: MouseEvent) {
    window.ipcRenderer.send('card:mouseenter', event);
}
function mouseleaveHandler(event: MouseEvent) {
    window.ipcRenderer.send('card:mouseleave', event);
}

export const mouse: Directive = {
    mounted: function (el: HTMLElement) {
        // 鼠标进入时触发 mouseenterHandler 函数
        el.addEventListener('mouseenter', mouseenterHandler);
        // 鼠标离开时触发 mouseleaveHandler 函数
        el.addEventListener('mouseleave', mouseleaveHandler);
    },
    // 只调用一次，指令与元素解绑时调用
    unmounted: function (el:HTMLElement) {
        // 移除事件监听器
        el.removeEventListener('mouseenter', mouseenterHandler);
        el.removeEventListener('mouseleave', mouseleaveHandler);
    }
};
