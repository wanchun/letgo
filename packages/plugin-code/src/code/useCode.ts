import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { ICodeItem } from '@webank/letgo-types';

function useCode() {
    const currentCodeItem = ref<ICodeItem>();
    const changeCurrentCodeItem = (item: ICodeItem | null) => {
        currentCodeItem.value = item;
    };
    return {
        currentCodeItem,
        changeCurrentCodeItem,
    };
}

export default createSharedComposable(useCode);
