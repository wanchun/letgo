import { defineComponent, PropType, onMounted, watch, ref } from 'vue';
import { IEditor, ProjectSchema, ComponentMetadata } from '@webank/letgo-types';
import { FSpin } from '@fesjs/fes-design';
import { SimulatorView } from '../simulator';
import { Project } from '../project';
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

        designer.onRendererReady(() => {
            isReady.value = true;
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
            type: Array as PropType<ComponentMetadata[]>,
        },
        defaultSchema: {
            type: Object as PropType<ProjectSchema>,
        },
        editor: {
            type: Object as PropType<IEditor>,
        },
        simulatorProps: {
            type: [Object, Function] as PropType<
                object | ((project: Project) => object)
            >,
        },
    },
    setup(props) {
        const { designer, ...designerProps } = props;

        let _designer: Designer;
        if (designer) {
            _designer = designer;
            _designer.setProps(designerProps);
        } else {
            _designer = new Designer(designerProps);
        }

        watch(
            [
                () => props.defaultSchema,
                () => props.componentMetadatas,
                () => props.editor,
                () => props.simulatorProps,
            ],
            () => {
                _designer.setProps({
                    componentMetadatas: props.componentMetadatas,
                    defaultSchema: props.defaultSchema,
                    editor: props.editor,
                    simulatorProps: props.simulatorProps,
                });
            },
        );

        onMounted(() => {
            if (props.onMount) {
                props.onMount(_designer);
            }
            _designer.postEvent('mount', _designer);
        });

        return () => {
            return (
                <div class={designerCls}>
                    <DragHostView designer={_designer} />
                    <ProjectView designer={_designer} />
                </div>
            );
        };
    },
});
