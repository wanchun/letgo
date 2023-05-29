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
        const currentDocument = computed(() => {
            return props.designer.currentDocument;
        });
        const currentState = computed(() => {
            return currentDocument.value?.state;
        });

        const codesState = computed(() => {
            const result: Record<string, any> = {};
            if (currentState.value?.codesInstance) {
                Object.keys(currentState.value.codesInstance).forEach((key) => {
                    result[key] = currentState.value.codesInstance[key].view;
                });
            }
            return result;
        });
        return () => {
            return (
                <div class={stateWrapCls}>
                    <div class={categoryCls}>
                        <StateHeader title="Code" isActive={activeItem.code} clickHeader={toggleCodeExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.code}>
                                <Tree value={codesState.value} />
                            </div>
                        </FadeInExpandTransition>
                    </div>
                    <div class={categoryCls}>
                        <StateHeader title="Components" isActive={activeItem.components} clickHeader={toggleComponentsExpend} />
                        <FadeInExpandTransition>
                            <div v-show={activeItem.components}>
                                <Tree value={currentState.value?.componentsInstance} />
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
