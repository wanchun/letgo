import {
    defineComponent,
    PropType,
    onBeforeMount,
    onMounted,
    watch,
} from 'vue';
import { IEditor, ProjectSchema, ComponentMetadata } from '@webank/letgo-types';
import { Designer } from './designer';
import { DragHostView } from './drag-host';
import { ProjectView, Project } from '../project';
import './designer-view.less';

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

        onBeforeMount(() => {
            _designer?.purge();
        });

        return () => {
            return (
                <div class="letgo-designer">
                    <DragHostView designer={_designer} />
                    <ProjectView designer={_designer} />
                </div>
            );
        };
    },
});
