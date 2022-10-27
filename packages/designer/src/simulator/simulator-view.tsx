import {
    defineComponent,
    PropType,
    onUnmounted,
    watch,
    CSSProperties,
} from 'vue';
import { Designer } from '../designer';
import { Simulator, SimulatorProps } from './simulator';
import { BemToolsView } from './bem-tools';
import css from './simulator-view.module.css';

const ContentView = defineComponent({
    name: 'ContentView',
    props: {
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { host } = props;
        return () => {
            const { viewport } = host;
            const frameStyle: CSSProperties = {
                transform: `scale(${viewport.scale})`,
                height: viewport.contentHeight,
                width: viewport.contentWidth,
            };
            return (
                <div class={css['letgo-simulator-content']}>
                    <iframe
                        name="SimulatorRenderer"
                        class={css['letgo-simulator-content-frame']}
                        style={frameStyle}
                        onLoad={(e) => {
                            if (e.target instanceof HTMLIFrameElement) {
                                host.mountContentFrame(e.target);
                            }
                        }}
                    />
                </div>
            );
        };
    },
});

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
            host,
        };
    },
    render() {
        const { deviceStyle, deviceClassName, device, host } = this;

        return (
            <div class={css['letgo-simulator']}>
                <div
                    class={[
                        css['letgo-simulator-canvas'],
                        deviceClassName ||
                            css[`letgo-simulator-device-${device}`],
                    ]}
                    style={deviceStyle?.canvas}
                >
                    <div
                        ref={(el) => {
                            if (el instanceof HTMLElement) {
                                host.mountViewport(el);
                            }
                        }}
                        class={css['letgo-simulator-canvas-viewport']}
                        style={deviceStyle?.viewport}
                    >
                        <BemToolsView host={host} />
                        <ContentView host={host} />
                    </div>
                </div>
            </div>
        );
    },
});
