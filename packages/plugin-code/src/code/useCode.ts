import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { CodeItem } from '@webank/letgo-types';

function useCode() {
    const currentCodeItem = ref<CodeItem>();
    const changeCurrentCodeItem = (item: CodeItem) => {
        currentCodeItem.value = item;
    };
    return {
        currentCodeItem,
        changeCurrentCodeItem,

    };
}

export default createSharedComposable(useCode);
