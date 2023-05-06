import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Simulator } from '../simulator';
import { BorderDetectingView } from './border-detecting';
import { BorderSelectingView } from './border-selecting';
import { toolsCls } from './tools.css';

export const BemToolsView = defineComponent({
    name: 'BemToolsView',
    props: {
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { host } = props;
        const { designMode } = host;
        const { scrollX, scrollY, scale } = host.viewport;

        return () => {
            if (designMode.value === 'live')
                return null;

            return (
                <div
                    class={toolsCls}
                    style={{
                        transform: `translate(${-scrollX * scale}px,${
                            -scrollY * scale
                        }px)`,
                    }}
                >
                    <BorderDetectingView key="hovering" host={host} />
                    <BorderSelectingView key="selecting" host={host} />
                </div>
            );
        };
    },
});
