import type { PropType } from 'vue';
import { computed, defineComponent, onUnmounted, provide, reactive, watch } from 'vue';
import { type CodeItem, CodeType } from '@harrywan/letgo-types';
import { buildGlobalUtils } from '@harrywan/letgo-renderer';
import { RouterView } from 'vue-router';
import { BASE_GLOBAL_CONTEXT } from '../constants';
import type { JavascriptFunctionImpl } from '../code-impl/javascript-function';
import type { VueSimulatorRenderer } from '../interface';
import { host } from '../host';
import { useCodesInstance } from '../code-impl/code-impl';
import LayoutView from './layout';

function useCssHandler() {
    const css = host.project.get('css') || '';
    let styleDom = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(styleDom);
    styleDom.innerText = css.replace(/\n/g, '');

    const offEvent = host.project.onCssChange(() => {
        styleDom.innerText = host.project.get('css')?.replace(/\n/g, '');
    });

    onUnmounted(() => {
        offEvent();
        styleDom = null;
    });
}

function useDocumentChange(simulator: VueSimulatorRenderer) {
    const offEvent = host.project.onCurrentDocumentChange(() => {
        simulator.initDocument();
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

        useDocumentChange(props.simulator);

        const code = host.project.code;
        const {
            codesInstance,
            initCodesInstance,
            createCodeInstance,
            deleteCodeInstance,
            changeCodeInstance,
            changeCodeInstanceId,
        } = useCodesInstance();

        const globalUtils = buildGlobalUtils(props.simulator.libraryMap, host.project.utils);
        const globalContext: Record<string, any> = reactive({
            utils: globalUtils,
            letgoContext: host.project.config || {},
        });

        host.project.updateUtilsInstance(globalUtils);

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
                globalContext[id] = globalContext[preId];
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
            immediate: true,
        });

        provide(BASE_GLOBAL_CONTEXT, globalContext);

        return () => {
            return (
                <LayoutView simulator={props.simulator}>
                    <RouterView></RouterView>
                </LayoutView>
            );
        };
    },
});
