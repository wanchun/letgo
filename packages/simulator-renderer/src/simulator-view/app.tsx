import type { PropType } from 'vue';
import { computed, defineComponent, onUnmounted, provide, reactive, watch } from 'vue';
import { type CodeItem, CodeType } from '@webank/letgo-types';
import type { JavascriptFunctionImpl } from '@webank/letgo-renderer';
import { BASE_GLOBAL_CONTEXT } from '../constants';

import type { VueSimulatorRenderer } from '../interface';
import { host } from '../host';
import { useCodesInstance } from '../context/code-impl';
import SimulatorView from './simulator-view';

function useCssHandler() {
    const css = host.project.get('css') || '';
    const styleDom = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(styleDom);
    styleDom.innerText = css.replace(/\n/g, '');

    const offEvent = host.project.onCssChange(() => {
        styleDom.innerText = host.project.get('css')?.replace(/\n/g, '');
    });

    onUnmounted(offEvent);
}

export default defineComponent({
    name: 'SimulatorApp',
    props: {
        simulator: {
            type: Object as PropType<VueSimulatorRenderer>,
            required: true,
        },
    },
    setup(props) {
        useCssHandler();

        const code = host.project.code;
        const {
            codesInstance,
            initCodesInstance,
            createCodeInstance,
            deleteCodeInstance,
            changeCodeInstance,
            changeCodeInstanceId,
        } = useCodesInstance();

        const globalContext: Record<string, any> = reactive({
            letgoContext: host.project.config || {},
        });

        initCodesInstance(code.codeMap, globalContext);

        const offCodeChangedEvent: (() => void)[] = [];
        offCodeChangedEvent.push(
            code.onCodesChanged((currentCodeMap: Map<string, CodeItem>) => {
                initCodesInstance(currentCodeMap, globalContext);
            }),
            code.onCodeItemAdd((item: CodeItem) => {
                createCodeInstance(item, globalContext);
                if (codesInstance[item.id].type === CodeType.JAVASCRIPT_FUNCTION)
                    globalContext[item.id] = (codesInstance[item.id] as JavascriptFunctionImpl).trigger.bind(codesInstance[item.id]);

                else
                    globalContext[item.id] = codesInstance[item.id];
            }),
            code.onCodeItemDelete((id: string) => {
                // TODO 有依赖的时候删除给提示
                deleteCodeInstance(id);
                delete globalContext[id];
            }),
            code.onCodeItemChanged((id: string, content: Record<string, any>) => {
                changeCodeInstance(id, content, globalContext);
            }),
            code.onCodeIdChanged((id: string, preId: string) => {
                changeCodeInstanceId(id, preId);
                globalContext[id] = codesInstance[id];
                delete globalContext[preId];
            }),
        );

        onUnmounted(() => {
            offCodeChangedEvent.forEach(fn => fn());
        });

        const viewState = computed(() => {
            return Object.keys(codesInstance).reduce((acc, cur) => {
                acc[cur] = codesInstance[cur].view;
                return acc;
            }, {} as { [key: string]: any });
        });

        watch(viewState, () => {
            host.project.updateGlobalCodesInstance(codesInstance);
        }, {
            deep: true,
        });

        provide(BASE_GLOBAL_CONTEXT, globalContext);

        return () => {
            return <SimulatorView simulator={props.simulator} />;
        };
    },
});
