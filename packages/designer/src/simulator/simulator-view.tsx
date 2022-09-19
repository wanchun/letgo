import { defineComponent, PropType, watch } from 'vue';
import { Simulator, SimulatorProps } from './simulator';
import { Designer } from '../designer';

export const SimulatorView = defineComponent({
    name: 'SimulatorView',
    props: {
        simulatorProps: {
            type: Object as PropType<
                SimulatorProps & {
                    designer: Designer;
                    onMount?: (host: Simulator) => void;
                }
            >,
        },
    },
    setup(props) {
        const { designer, onMount } = props.simulatorProps;

        const host =
            (designer.simulator as Simulator) || new Simulator(designer);
        host.setProps(props.simulatorProps);

        onMount?.(host);

        watch(
            () => props.simulatorProps,
            () => {
                host.setProps(props.simulatorProps);
            },
        );

        return () => {
            return (
                <div class="letgo-simulator">
                    <div class="letgo-canvas">
                        <div class="letgo-viewport"></div>
                    </div>
                </div>
            );
        };
    },
});
