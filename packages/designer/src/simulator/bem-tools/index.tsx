import type { PropType } from 'vue';
import { defineComponent, onBeforeUnmount, ref } from 'vue';
import { editor } from '@harrywan/letgo-editor-core';
import type { Simulator } from '../simulator';
import { BorderDetectingView } from './border-detecting';
import { BorderSelectingView } from './border-selecting';
import { InsertionView } from './insertion';
import './tools.less';

export const BemToolsView = defineComponent({
    name: 'BemToolsView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { simulator } = props;

        const isPointerEvents = ref(false);

        const callback = editor.onGot('isSkeletonDragging', (val) => {
            isPointerEvents.value = val;
        });

        onBeforeUnmount(() => {
            callback?.();
        });

        return () => {
            if (simulator.designMode === 'live')
                return null;

            const { scrollX, scrollY, scale } = simulator.viewport;

            return (
                <div
                    class="letgo-designer-sim-tools"
                    style={{
                        transform: `translate(${-scrollX * scale}px,${
                            -scrollY * scale
                        }px)`,
                        pointerEvents: isPointerEvents.value ? 'inherit' : 'none',
                    }}
                >
                    <BorderDetectingView key="hovering" simulator={simulator} />
                    <BorderSelectingView key="selecting" simulator={simulator} />
                    <InsertionView key="insert" simulator={simulator} />
                </div>
            );
        };
    },
});
