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
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { host } = props;

        return () => {
            if (host.designMode === 'live')
                return null;

            const { scrollX, scrollY, scale } = host.viewport;

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
                    <InsertionView key="insert" host={host}/>
                </div>
            );
        };
    },
});
