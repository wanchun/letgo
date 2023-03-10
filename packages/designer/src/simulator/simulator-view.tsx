import {
    defineComponent,
    PropType,
    onUnmounted,
    watch,
    CSSProperties,
    nextTick,
    computed,
} from 'vue';
import { Designer } from '../designer';
import { Simulator, SimulatorProps } from './simulator';
import { BemToolsView } from './bem-tools';
import {
    canvasCls,
    canvasViewportCls,
    contentCls,
    contentIframeCls,
    simulatorCls,
    deviceDefaultCls,
    deviceIphone6Cls,
    deviceIphoneXCls,
    deviceMobileCls,
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

        const { deviceStyle } = host;
        const innerDeviceCls = computed(() => {
            if (host.deviceClassName.value) {
                return host.deviceClassName.value;
            }
            if (host.device.value === 'mobile') {
                return deviceMobileCls;
            }
            if (host.device.value === 'iphoneX') {
                return deviceIphoneXCls;
            }
            if (host.device.value === 'iphone6') {
                return deviceIphone6Cls;
            }

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
                                // ???el?????????????????? mountViewport
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
