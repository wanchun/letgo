import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    reactive,
    ref,
} from 'vue';

import type { Designer, INode } from '@webank/letgo-designer';
import FadeInExpandTransition from '../fade-in-expand-transition';
import Tree from '../tree/tree';
import useCode from '../code/useCode';
import StateHeader from './state-header';

import { categoryCls, stateWrapCls } from './state.css';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const activeItem = reactive<Record<string, boolean>>({
            code: true,
            components: true,
            global: true,
        });
        const toggleExpend = (item: string) => {
            activeItem[item] = !activeItem[item];
        };
        const toggleGlobalExpend = () => {
            toggleExpend('global');
        };
        const toggleComponentsExpend = () => {
            toggleExpend('components');
        };
        const toggleCodeExpend = () => {
            toggleExpend('code');
        };

        const globalState = computed(() => {
            return props.designer.project.config;
        });

        const { codeInstances } = useCode();
        const codeState = computed(() => {
            const result: Record<string, any> = {};
            Object.keys(codeInstances).forEach((key) => {
                result[key] = codeInstances[key].view;
            });
            return result;
        });

        const componentsState = ref<Record<string, any>>({});
        function onNodeAdd(node: INode) {
            componentsState.value[node.ref] = node.propsData;
            node.onPropChange(() => {
                componentsState.value[node.ref] = node.propsData;
            });
            node.onChildrenChange(onNodeChange);
        }
        function onNodeDelete(node: INode) {
            delete componentsState.value[node.ref];
        }
        function onNodeChange(param: { type: string; node: INode }) {
            if (param.type === 'insert')
                onNodeAdd(param.node);

            else if (param.type === 'delete')
                onNodeDelete(param.node);
        }
        props.designer.onSimulatorReady(() => {
            const currentDocument = props.designer.currentDocument;
            const rootNode = currentDocument.root;
            // rootNode.onChildrenChange(onNodeChange);
            // props.designer.simulator.onEvent('componentInstanceChange', (options: {
            //     docId: string
            //     id: string
            //     instances: IComponentInstance[]
            // }) => {
            //     const currentDocument = props.designer.currentDocument;
            //     const node = currentDocument.getNode(options.id);
            //     if (node) {
            //         if (node.id === 'root')
            //             return;
            //         const refName = node.ref;
            //         // TODO 暂不支持多个实例
            //         if (!options.instances || options.instances.length === 0) {
            //             delete componentInstances.value[refName];
            //         }
            //         else if (options.instances.length > 1) {
            //             console.warn('[letgo]: component instances 暂不支持多个实例');
            //             delete componentInstances.value[refName];
            //         }
            //         else {
            //             nodeIdToRef[options.id] = node.ref;
            //             componentInstances.value[refName] = props.designer.simulator.getComponentInstancesExpose(options.instances[0]);
            //             node.onPropChange(() => {
            //                 componentInstances.value[refName] = props.designer.simulator.getComponentInstancesExpose(options.instances[0]);
            //             });
            //         }
            //     }
            //     else {
            //         const refName = nodeIdToRef[options.id];
            //         if (refName)
            //             delete componentInstances.value[refName];
            //     }
            // });
        });

        return () => {
            return (
                <div class={stateWrapCls}>
                    <div class={categoryCls}>
                        <StateHeader title="Code" isActive={activeItem.code} clickHeader={toggleCodeExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.code}>
                                <Tree value={codeState.value} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                    <div class={categoryCls}>
                        <StateHeader title="Components" isActive={activeItem.components} clickHeader={toggleComponentsExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.components}>
                                <Tree value={componentsState.value} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                    <div class={categoryCls}>
                        <StateHeader title="Globals" isActive={activeItem.global} clickHeader={toggleGlobalExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.global}>
                                <Tree value={globalState.value} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                </div>
            );
        };
    },
});
