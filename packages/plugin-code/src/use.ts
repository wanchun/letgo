import type { Designer } from '@webank/letgo-designer';
import { onBeforeUnmount, ref, watch } from 'vue';
import type { Ref } from 'vue';

export function useOnClickSim(designer: Designer, cb: () => void) {
    const isSimulatorReady: Ref<boolean> = ref(designer.isRendererReady);

    const disposeFunctions: Array<() => void> = [
        designer.onSimulatorReady(() => {
            isSimulatorReady.value = true;
        }),
    ];

    watch(isSimulatorReady, () => {
        if (isSimulatorReady.value) {
            disposeFunctions.push(
                // 点击画布，则关闭详情
                designer.simulator.onEvent('contentDocument.mousedown', cb),
            );
        }
    }, {
        immediate: true,
    });

    onBeforeUnmount(() => {
        disposeFunctions.forEach(clear => clear());
    });
}
