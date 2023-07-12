import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { CodeItem } from '@fesjs/letgo-types';

function useCode() {
    const currentCodeItem = ref<CodeItem>();
    const changeCurrentCodeItem = (item: CodeItem | null) => {
        currentCodeItem.value = item;
    };
    return {
        currentCodeItem,
        changeCurrentCodeItem,
    };
}

export default createSharedComposable(useCode);
