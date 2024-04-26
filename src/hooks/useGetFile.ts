import { ref } from "vue";
import type {Ref} from "vue";
async function getFile<T>(path: string): Promise<[Ref<T|undefined>, Ref<boolean>]> {
    let loading = ref<boolean>(true);
    let data = ref<T|undefined>()
    try {
        data.value = await window.ipcRenderer.invoke('ready-file', path);
        loading.value = false;
    }
    catch (error) {
    }
    return [data, loading]
}
export default getFile;