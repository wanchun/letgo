import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    reactive,
} from 'vue';
import { isNil } from 'lodash-es';
import { IEnumCodeType } from '@webank/letgo-types';
import type { Designer } from '@webank/letgo-designer';
import FadeInExpandTransition from './fade-in-expand-transition';
import Tree from './tree/tree';
import StateHeader from './state-header';

import './state.less';

export default defineComponent({
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
        searchText: String,
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

        const rootSchemaType = computed(() => {
            return props.designer.currentDocument?.root.componentName;
        });

        const currentState = computed(() => {
            return props.designer.currentDocument?.state;
        });

        const globalState = computed(() => {
            if (rootSchemaType.value === 'Page') {
                const codesInstance = props.designer.project.codesInstance;
                const instances = Object.keys(codesInstance).reduce((acc, cur) => {
                    if (codesInstance[cur].type === IEnumCodeType.LIFECYCLE_HOOK)
                        return acc;
                    if (isNil(props.searchText)) {
                        acc[cur] = codesInstance[cur].view;
                    }
                    else {
                        if (cur.includes(props.searchText))
                            acc[cur] = codesInstance[cur].view;
                    }
                    return acc;
                }, {} as Record<string, any>);

                return {
                    ...instances,
                    ...props.designer.project.extraGlobalState,

                };
            }
            else if (rootSchemaType.value === 'Component') {
                return {
                    $utils: props.designer.project.extraGlobalState.$utils,
                    props: currentState.value?.props,
                };
            }
            return {};
        });

        const codesState = computed(() => {
            const codesInstance = currentState.value?.codesInstance || {};
            return Object.keys(codesInstance).reduce((acc, cur) => {
                if (codesInstance[cur].type === IEnumCodeType.LIFECYCLE_HOOK)
                    return acc;
                if (isNil(props.searchText)) {
                    acc[cur] = codesInstance[cur].view;
                }
                else {
                    if (cur.includes(props.searchText))
                        acc[cur] = codesInstance[cur].view;
                }

                return acc;
            }, {} as Record<string, any>);
        });

        const componentState = computed(() => {
            const componentsInstance = currentState.value?.componentsInstance || {};
            return Object.keys(componentsInstance).reduce((acc, cur) => {
                if (isNil(props.searchText)) {
                    acc[cur] = componentsInstance[cur];
                }
                else {
                    if (cur.includes(props.searchText))
                        acc[cur] = componentsInstance[cur];
                }

                return acc;
            }, {} as Record<string, any>);
        });

        return () => {
            return (
                <div class="letgo-plg-code__state">
                    <div class="letgo-plg-code__state-category">
                        <StateHeader title="状态" isActive={activeItem.code} clickHeader={toggleCodeExpend} />
                        <FadeInExpandTransition>
                            <Tree v-show={activeItem.code} value={codesState.value} />
                        </FadeInExpandTransition>
                    </div>
                    <div class="letgo-plg-code__state-category">
                        <StateHeader title="组件" isActive={activeItem.components} clickHeader={toggleComponentsExpend} />
                        <FadeInExpandTransition>
                            <Tree v-show={activeItem.components} value={componentState.value} />
                        </FadeInExpandTransition>
                    </div>
                    <div class="letgo-plg-code__state-category">
                        <StateHeader title="全局状态" isActive={activeItem.global} clickHeader={toggleGlobalExpend} />
                        <FadeInExpandTransition>
                            <Tree v-show={activeItem.global} value={globalState.value} />
                        </FadeInExpandTransition>
                    </div>
                </div>
            );
        };
    },
});
