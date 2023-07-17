import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Simulator } from '../simulator';
import { BorderDetectingView } from './border-detecting';
import { BorderSelectingView } from './border-selecting';
import { InsertionView } from './insertion';
import { toolsCls } from './tools.css';

export const BemToolsView = defineComponent({
    name: 'BemToolsView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { simulator } = props;

        return () => {
            if (simulator.designMode === 'live')
                return null;

            const { scrollX, scrollY, scale } = simulator.viewport;

            return (
                <div
                    class={toolsCls}
                    style={{
                        transform: `translate(${-scrollX * scale}px,${
                            -scrollY * scale
                        }px)`,
                    }}
                >
                    <BorderDetectingView key="hovering" simulator={simulator} />
                    <BorderSelectingView key="selecting" simulator={simulator} />
                    <InsertionView key="insert" simulator={simulator}/>
                </div>
            );
        };
    },
});
