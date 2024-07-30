import { createSharedComposable } from '@vueuse/core';
import { onLogger } from '@webank/letgo-common';
import { computed, onUnmounted, ref, shallowReactive } from 'vue';
import type { FormattedLog } from './log-formatter';
import { formatLog } from './log-formatter';

function _usePaneVisible() {
    const paneVisible = ref(false);

    return {
        paneVisible,
    };
}

export const useSharedPaneVisible = createSharedComposable(_usePaneVisible);

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
        if (log.belong === 'simulator') {
            console.log(log);

            logList.push(formatLog(log));
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
