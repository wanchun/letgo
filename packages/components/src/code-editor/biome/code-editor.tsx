import { defineComponent, onMounted, ref } from 'vue';
import { LoadingState } from './types';

function throttle(callback: () => void): () => void {
    const timeout = setTimeout(callback, 100);

    return () => {
        clearTimeout(timeout);
    };
}

function useBiomeWorker(setLoadingState: (state: LoadingState) => void, setPlaygroundState: (state: any) => void, getFileState: (state: any, filename: string) => any) {
    const workerRef = ref();
    workerRef.value = new Worker(
        new URL('./workers/biomeWorker', import.meta.url),
        { type: 'module' },
    );

    workerRef.value.addEventListener('message', (event) => {
        switch (event.data.type) {
            case 'init': {
                const loadingState = event.data.loadingState as LoadingState;
                setLoadingState(loadingState);
                break;
            }

            case 'updated': {
                const { filename, biomeOutput } = event.data;
                setPlaygroundState(state => ({
                    ...state,
                    files: {
                        ...state.files,
                        [filename]: {
                            ...getFileState(state, filename),
                            biome: biomeOutput,
                        },
                    },
                }));
                break;
            }

            default:
                console.error(`Unknown message ${event.data.type}`);
        }
    });

    workerRef.value?.postMessage({
        type: 'init',
    });
}

export default defineComponent({
    setup() {
        const loadingState = ref(LoadingState.Loading);
        const setLoadingState = (state: LoadingState) => {
            loadingState.value = state;
        };

        useBiomeWorker(setLoadingState);
    },
});
