import { defineComponent, PropType, onUnmounted, watch } from 'vue';
import { Simulator, SimulatorProps } from './simulator';
import { Designer } from '../designer';
import './simulator-view.less';

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

        const { device, deviceStyle, deviceClassName } = host;

        onMount?.(host);

        watch(
            () => props.simulatorProps,
            () => {
                host.setProps(props.simulatorProps);
            },
            {
                immediate: true,
            },
        );

        onUnmounted(() => {
            host.pure();
        });

        return {
            deviceClassName,
            device,
            deviceStyle,
        };
    },
    render() {
        const { deviceStyle, deviceClassName, device } = this;

        return (
            <div class="letgo-simulator">
                <div
                    class={[
                        'letgo-simulator-canvas',
                        deviceClassName || `letgo-simulator-device-${device}`,
                    ]}
                    style={deviceStyle?.canvas}
                >
                    <div
                        class="letgo-simulator-canvas-viewport"
                        style={deviceStyle?.viewport}
                    ></div>
                </div>
            </div>
        );
    },
});
