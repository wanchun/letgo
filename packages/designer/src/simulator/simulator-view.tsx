import type {
    CSSProperties,
    PropType,
} from 'vue';
import {
    computed,
    defineComponent,
    nextTick,
    onBeforeUnmount,
    onUnmounted,
    ref,
    shallowRef,
    watch,
} from 'vue';
import type { IPublicTypeSimulatorProps } from '@webank/letgo-types';
import type { Designer } from '../designer';
import { Simulator } from './simulator';
import { BemToolsView } from './bem-tools';
import './simulator-view.less';

const IframeView = defineComponent({
    name: 'IframeView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { simulator } = props;
        const contentWin = shallowRef<HTMLIFrameElement>();
        const el = ref<HTMLElement>();

        const trigger = () => {
            el.value?.click();
        };

        let initialized = false;

        watch(contentWin, () => {
            if (contentWin.value && !initialized) {
                initialized = true;
                const doc = contentWin.value.contentWindow.document;
                doc.addEventListener('click', trigger);
            }
        });

        onBeforeUnmount(() => {
            if (contentWin.value) {
                const doc = contentWin.value.contentWindow.document;
                doc.removeEventListener('click', trigger);
            }
        });

        return () => {
            const { viewport } = simulator;
            const frameStyle: CSSProperties = {
                transform: `scale(${viewport.scale})`,
                height: viewport.contentHeight,
                width: viewport.contentWidth,
            };

            return (
                <div ref={el} class="letgo-simulator__content">
                    <iframe
                        name="SimulatorRenderer"
                        class="letgo-simulator__content-iframe"
                        style={frameStyle}
                        onLoad={(e) => {
                            if (e.target instanceof HTMLIFrameElement) {
                                contentWin.value = e.target;
                                simulator.mountContentFrame(e.target);
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
                IPublicTypeSimulatorProps & {
                    designer: Designer;
                    onMount?: (host: Simulator) => void;
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
                return 'letgo-simulator__device-mobile';

            return 'letgo-simulator__device';
        });

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
            <div class="letgo-simulator">
                <div
                    class={['letgo-simulator__canvas', innerDeviceCls]}
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
                        class="letgo-simulator__canvas-view"
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
