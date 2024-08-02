import { createSharedComposable } from '@vueuse/core';
import { onLogger } from '@webank/letgo-common';
import { computed, onUnmounted, shallowReactive } from 'vue';
import type { FormattedLog } from './log-formatter';
import { formatLog } from './log-formatter';

function _useLog() {
    const logList = shallowReactive<FormattedLog[]>([]);

    const errorCount = computed(() => {
        return logList.filter(item => item.level === 'error').length;
    });
    const warnCount = computed(() => {
        return logList.filter(item => item.level === 'warn').length;
    });
    const infoCount = computed(() => {
        return logList.filter(item => item.level === 'info').length;
    });

    const unListener = onLogger((log) => {
        if (['simulator', 'code-generator'].includes(log.belong)) {
            const result = formatLog(log);
            if (logList.findIndex(item => item.id === result.id && item.formattedMsg === result.formattedMsg) === -1)
                logList.unshift(result);
        }
        else {
            // eslint-disable-next-line no-console
            console.log(log);
        }
    });

    const clearAllLog = () => {
        logList.splice(0, logList.length);
    };

    onUnmounted(() => {
        unListener();
    });

    return {
        logList,
        clearAllLog,

        errorCount,
        warnCount,
        infoCount,
    };
}

export const useSharedLog = createSharedComposable(_useLog);
