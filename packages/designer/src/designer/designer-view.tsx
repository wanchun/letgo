import type { PropType } from 'vue';
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type {
    IPublicEditor,
    IPublicTypeComponentMetadata,
} from '@webank/letgo-types';
import { SimulatorView } from '../simulator';
import type { Project } from '../project';
import type { Designer } from './designer';
import { DragHostView } from './drag-host';
import './designer-view.less';

const BuiltinLoading = defineComponent({
    setup() {
        return () => {
            return (
                <div class="letgo-designer__loading">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <defs>
                            <filter id="svgSpinnersGooeyBalls20">
                                <feGaussianBlur in="SourceGraphic" result="y" stdDeviation="1" />
                                <feColorMatrix in="y" result="z" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" />
                                <feBlend in="SourceGraphic" in2="z" />
                            </filter>
                        </defs>
                        <g filter="url(#svgSpinnersGooeyBalls20)">
                            <circle cx="5" cy="12" r="4" fill="currentColor"><animate attributeName="cx" calcMode="spline" dur="2s" keySplines=".36,.62,.43,.99;.79,0,.58,.57" repeatCount="indefinite" values="5;8;5" /></circle>
                            <circle cx="19" cy="12" r="4" fill="currentColor"><animate attributeName="cx" calcMode="spline" dur="2s" keySplines=".36,.62,.43,.99;.79,0,.58,.57" repeatCount="indefinite" values="19;16;19" /></circle>
                            <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
                        </g>
                    </svg>
                </div>
            );
        };
    },
});

export const DesignerView = defineComponent({
    name: 'DesignerView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
            required: true,
        },
        onMount: {
            type: Function as PropType<(designer: Designer) => void>,
        },
        componentMetadatas: {
            type: Array as PropType<IPublicTypeComponentMetadata[]>,
        },
        editor: {
            type: Object as PropType<IPublicEditor>,
        },
        simulatorProps: {
            type: [Object, Function] as PropType<
                object | ((project: Project) => object)
            >,
        },
    },
    setup(props) {
        const { designer, editor } = props;

        watch(
            [
                () => props.componentMetadatas,
                () => props.editor,
                () => props.simulatorProps,
            ],
            () => {
                const { designer, ...designerProps } = props;
                designer.setProps(designerProps);
            },
            {
                immediate: true,
            },
        );

        const isReady = ref(false);

        const off = designer.onRendererReady(() => {
            isReady.value = true;
        });

        onMounted(() => {
            editor.emit('designer.mount', designer);
            props.onMount?.(designer);
        });

        onBeforeUnmount(() => {
            off?.();
        });

        return () => {
            const { simulatorProps } = designer;
            return (
                <div class="letgo-designer">
                    {!isReady.value && <BuiltinLoading />}
                    <DragHostView designer={designer} />
                    <SimulatorView simulatorProps={simulatorProps} />
                </div>
            );
        };
    },
});
