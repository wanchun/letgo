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

const IframeView = defineComponent({
    name: 'IframeView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { simulator } = props;
        return () => {
            const { viewport } = simulator;
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
                                simulator.mountContentFrame(e.target);
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

        const simulator
            = (designer.simulator as Simulator) || new Simulator(designer);

        const { deviceStyle } = simulator;

        const innerDeviceCls = computed(() => {
            if (simulator.deviceClassName)
                return simulator.deviceClassName;

            if (simulator.device === 'mobile')
                return deviceMobileCls;

            return deviceDefaultCls;
        });

        console.log('componentMetaMap:', designer.componentMetaMap);

        onMount?.(simulator);

        watch(
            () => props.simulatorProps,
            () => {
                simulator.setProps(props.simulatorProps);
            },
            {
                immediate: true,
            },
        );

        onUnmounted(() => {
            simulator.purge();
        });

        return {
            innerDeviceCls,
            deviceStyle,
            simulator,
        };
    },
    render() {
        const { deviceStyle, simulator, innerDeviceCls } = this;

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
                                    simulator.mountViewport(el);
                                });
                            }
                        }}
                        class={canvasViewportCls}
                        style={deviceStyle?.viewport}
                    >
                        <BemToolsView simulator={simulator} />
                        <IframeView simulator={simulator} />
                    </div>
                </div>
            </div>
        );
    },
});
