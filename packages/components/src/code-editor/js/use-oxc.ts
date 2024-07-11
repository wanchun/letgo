import type { Ref } from 'vue';
import { computed, reactive, ref } from 'vue';
import { createGlobalState } from '@vueuse/core';

import { throttle } from 'lodash-es';
import { LoadingState } from './types';
import type { OxcOutput } from './types';

function _usOxcWorker() {
    const files = reactive<Record<string, OxcOutput>>({});
    const loadingState = ref<LoadingState>();
    const workerRef = ref<Worker>(new Worker(
        new URL('./oxc-worker', import.meta.url),
        { type: 'module' },
    ));

    workerRef.value.addEventListener('message', (event) => {
        switch (event.data.type) {
            case 'init': {
                const curLoadingState = event.data.loadingState as LoadingState;
                loadingState.value = curLoadingState;
                break;
            }

            case 'updated': {
                const { filename, oxcOutput } = event.data;
                files[filename] = oxcOutput;
                break;
            }

            default:
                console.error(`Unknown message ${event.data.type}`);
        }
    });

    workerRef.value?.postMessage({
        type: 'init',
    });

    const updateFile = (filename: string, code: string) => {
        workerRef.value.postMessage({ type: 'update', filename, code });
    };

    return {
        loadingState,
        files,
        updateFile,
    };
}

export const useSharedBiomeWorker = createGlobalState(_usOxcWorker);

let filenameCounter = 0;
export function useOxcWorker(id: Ref<string>) {
    const filename = computed(() => {
        return `${id.value || filenameCounter++}.js`;
    });
    const { files, updateFile, loadingState } = useSharedBiomeWorker();

    const oxcOutput = computed(() => {
        return files[filename.value];
    });

    const getFormatCode = (fileName: string) => {
        const output = files[fileName];
        return output?.formatter;
    };

    const updateCode = throttle((doc: string) => {
        if (loadingState.value === LoadingState.Success)
            updateFile(filename.value, doc);
    }, 100);

    return {
        oxcOutput,
        updateCode,
        getFormatCode,
    };
};
