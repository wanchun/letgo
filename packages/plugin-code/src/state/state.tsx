import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    reactive,
} from 'vue';

import type { Designer } from '@webank/letgo-designer';
import FadeInExpandTransition from '../fade-in-expand-transition';
import Tree from '../tree/tree';
import StateHeader from './state-header';

import './state.less';

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
            const instances = Object.keys(props.designer.project.codesInstance).reduce((acc, cur) => {
                acc[cur] = props.designer.project.codesInstance[cur].view;
                return acc;
            }, {} as Record<string, any>);
            return {
                ...instances,
                ...props.designer.project.extraGlobalState,
            };
        });
        const currentDocument = computed(() => {
            return props.designer.currentDocument;
        });
        const currentState = computed(() => {
            return currentDocument.value?.state;
        });

        const codesState = computed(() => {
            const codesInstance = currentState.value?.codesInstance || {};
            return Object.keys(codesInstance).reduce((acc, cur) => {
                acc[cur] = codesInstance[cur].view;
                return acc;
            }, {} as Record<string, any>);
        });
        return () => {
            return (
                <div class="letgo-plg-code__state">
                    <div class="letgo-plg-code__state-category">
                        <StateHeader title="状态" isActive={activeItem.code} clickHeader={toggleCodeExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.code}>
                                <Tree value={codesState.value} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                    <div class="letgo-plg-code__state-category">
                        <StateHeader title="组件" isActive={activeItem.components} clickHeader={toggleComponentsExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.components}>
                                <Tree value={currentState.value?.componentsInstance} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                    <div class="letgo-plg-code__state-category">
                        <StateHeader title="全局状态" isActive={activeItem.global} clickHeader={toggleGlobalExpend} />
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
