import { defineComponent, PropType } from 'vue';
import { Simulator } from '../simulator';
import { BorderDetectingView } from './border-detecting';

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
            if (designMode.value === 'live') {
                return null;
            }
            return (
                <div
                    class="letgo-bem-tools"
                    style={{
                        transform: `translate(${-scrollX * scale}px,${
                            -scrollY * scale
                        }px)`,
                    }}
                >
                    <BorderDetectingView key="hovering" host={host} />
                </div>
            );
        };
    },
});
