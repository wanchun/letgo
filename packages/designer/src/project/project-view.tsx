import { defineComponent, PropType, ref } from 'vue';
import { FSpin } from '@fesjs/fes-design';
import { SimulatorView } from '../simulator';
import { Designer } from '../designer';
import './project-view.less';

const BuiltinLoading = defineComponent({
    setup() {
        return () => {
            return (
                <div class="letgo-engine-loading-wrapper">
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
        const { project } = designer;

        const foreUpdateRef = ref(0);

        project.onRendererReady(() => {
            foreUpdateRef.value += foreUpdateRef.value;
        });

        return () => {
            const { simulatorProps } = project;
            return (
                <div class="letgo-project">
                    <div className="letgo-project-content">
                        {!project?.simulator?.renderer && <BuiltinLoading />}
                        <SimulatorView {...simulatorProps} />
                    </div>
                </div>
            );
        };
    },
});
