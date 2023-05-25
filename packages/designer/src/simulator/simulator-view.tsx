import type {
    CSSProperties,
    PropType,
} from 'vue';
import {
    computed,
    defineComponent,
    nextTick,
    onUnmounted,
    watch,
} from 'vue';
import type { Designer } from '../designer';
import type { ISimulatorProps } from './simulator';
import { Simulator } from './simulator';
import { BemToolsView } from './bem-tools';
import {
    canvasCls,
    canvasViewportCls,
    contentCls,
    contentIframeCls,
    deviceDefaultCls,
    deviceMobileCls,
    simulatorCls,
} from './simulator-view.css';

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
                <div class={contentCls}>
                    <iframe
                        name="SimulatorRenderer"
                        class={contentIframeCls}
                        style={frameStyle}
                        onLoad={(e) => {
                            if (e.target instanceof HTMLIFrameElement)
                                host.mountContentFrame(e.target);
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
                ISimulatorProps & {
                    designer: Designer
                    onMount?: (host: Simulator) => void
                }
            >,
        },
    },
    setup(props) {
        const { designer, onMount } = props.simulatorProps;

        const host
            = (designer.simulator as Simulator) || new Simulator(designer);

        const { deviceStyle } = host;

        const innerDeviceCls = computed(() => {
            if (host.deviceClassName)
                return host.deviceClassName;

            if (host.device === 'mobile')
                return deviceMobileCls;

            return deviceDefaultCls;
        });

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
            innerDeviceCls,
            deviceStyle,
            host,
        };
    },
    render() {
        const { deviceStyle, host, innerDeviceCls } = this;

        return (
            <div class={simulatorCls}>
                <div
                    class={[canvasCls, innerDeviceCls]}
                    style={deviceStyle?.canvas}
                >
                    <div
                        ref={(el) => {
                            if (el instanceof HTMLElement) {
                                // 等el渲染后再执行 mountViewport
                                nextTick(() => {
                                    host.mountViewport(el);
                                });
                            }
                        }}
                        class={canvasViewportCls}
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
