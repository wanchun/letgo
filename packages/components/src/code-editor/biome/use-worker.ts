import type { ComputedRef } from 'vue';
import { computed, reactive, ref, watch } from 'vue';
import { createSharedComposable, watchThrottled } from '@vueuse/core';

import { LoadingState } from './types';
import type { BiomeOutput } from './types';

export interface UseBiomeWorker {
    doc: string
    language?: 'json' | 'javascript'
    id?: string
}

function _useBiomeWorker() {
    const files = reactive<Record<string, BiomeOutput>>({});
    const loadingState = ref<LoadingState>();
    const workerRef = ref<Worker>(new Worker(
        new URL('./biome-worker', import.meta.url),
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
                const { filename, biomeOutput } = event.data;
                files[filename] = biomeOutput;
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

    const updateGlobals = (globals: string[]) => {
        workerRef.value.postMessage({ type: 'updateGlobals', globals });
    };

    return {
        loadingState,
        files,
        updateFile,
        updateGlobals,
    };
}

export const useSharedBiomeWorker = createSharedComposable(_useBiomeWorker);

let filenameCounter = 0;
export function useBiomeWorker(props: UseBiomeWorker, scopeVariables?: ComputedRef<Record<string, any>>) {
    const ext = props.language === 'json' ? '.json' : '.js';
    const filename = `${props.id || filenameCounter++}${ext}`;
    const { files, updateFile, loadingState, updateGlobals } = useSharedBiomeWorker();

    const biomeOutput = computed(() => {
        return files[filename];
    });

    watchThrottled(() => props.doc, () => {
        if (loadingState.value === LoadingState.Success)
            updateFile(filename, props.doc);
    }, {
        throttle: 100,
    });

    if (scopeVariables) {
        watch(scopeVariables, () => {
            const globals = Object.keys(scopeVariables.value);
            if (globals) {
                updateGlobals(globals);
                loadingState.value === LoadingState.Success && updateFile(filename, props.doc);
            }
        }, {
            immediate: true,
        });
    }

    return {
        biomeOutput,
    };
};
