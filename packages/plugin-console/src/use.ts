import { createSharedComposable } from '@vueuse/core';
import type { LogContent } from '@webank/letgo-common';
import { onLogger } from '@webank/letgo-common';
import { computed, onMounted, shallowReactive } from 'vue';

function _useLog() {
    const logList = shallowReactive<LogContent[]>([]);

    const errorCount = computed(() => {
        return logList.filter(item => item.level === 'error').length;
    });

    const warnCount = computed(() => {
        return logList.filter(item => item.level === 'warn').length;
    });

    const unListener = onLogger((log) => {
        logList.push(log);
    });

    onMounted(() => {
        unListener();
    });

    return {
        logList,
        errorCount,
        warnCount,
    };
}

export const useSharedLog = createSharedComposable(_useLog);
