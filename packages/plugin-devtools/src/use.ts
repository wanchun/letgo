import { createSharedComposable } from '@vueuse/core';
import { ref } from 'vue';
import { TOOLS } from './constants';

function _useTool() {
    const currentTool = ref(TOOLS[0].value);

    const changeTool = (toolName: string) => {
        currentTool.value = toolName;
    };

    return {
        currentTool,
        changeTool,
    };
}

export const useSharedTool = createSharedComposable(_useTool);
