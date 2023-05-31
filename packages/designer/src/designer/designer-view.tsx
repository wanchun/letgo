import type { PropType } from 'vue';
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { IPublicEditor, IPublicTypeComponentMetadata, IPublicTypeProjectSchema } from '@webank/letgo-types';
import { FSpin } from '@fesjs/fes-design';
import { SimulatorView } from '../simulator';
import type { Project } from '../project';
import { Designer } from './designer';
import { DragHostView } from './drag-host';
import {
    designerCls,
    loadingCls,
    projectCls,
    projectContentCls,
} from './designer-view.css';

const BuiltinLoading = defineComponent({
    setup() {
        return () => {
            return (
                <div class={loadingCls}>
                    <FSpin size={'large'} />
                </div>
            );
        };
    },
});

export const ProjectView = defineComponent({
    name: 'ProjectView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;

        const isReady = ref(false);

        const off = designer.onRendererReady(() => {
            isReady.value = true;
        });

        onBeforeUnmount(() => {
            off?.();
        });

        return () => {
            const { simulatorProps } = designer;
            return (
                <div class={projectCls}>
                    <div class={projectContentCls}>
                        {!isReady.value && <BuiltinLoading />}
                        <SimulatorView simulatorProps={simulatorProps} />
                    </div>
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
        },
        onMount: {
            type: Function as PropType<(designer: Designer) => void>,
        },
        componentMetadatas: {
            type: Array as PropType<IPublicTypeComponentMetadata[]>,
        },
        defaultSchema: {
            type: Object as PropType<IPublicTypeProjectSchema>,
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
        const { designer: _designer, ...designerProps } = props;

        const designer: Designer = _designer ?? new Designer(designerProps);
        designer.setProps(designerProps);

        watch(
            [
                () => props.defaultSchema,
                () => props.componentMetadatas,
                () => props.editor,
                () => props.simulatorProps,
            ],
            () => {
                designer.setProps({
                    componentMetadatas: props.componentMetadatas,
                    defaultSchema: props.defaultSchema,
                    editor: props.editor,
                    simulatorProps: props.simulatorProps,
                });
            },
        );

        onMounted(() => {
            props.onMount?.(designer);
            designer.editor.emit('designer.mount', designer);
        });

        onBeforeUnmount(() => {
            designer.purge();
        });

        return () => {
            return (
                <div class={designerCls}>
                    <DragHostView designer={designer} />
                    <ProjectView designer={designer} />
                </div>
            );
        };
    },
});
