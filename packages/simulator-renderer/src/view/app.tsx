import type { PropType } from 'vue';
import { computed, defineComponent, onUnmounted, provide, reactive, watch } from 'vue';
import type { ICodeItem } from '@webank/letgo-types';
import { buildGlobalUtils } from '@webank/letgo-renderer';
import { RouterView } from 'vue-router';
import { BASE_GLOBAL_CONTEXT } from '../constants';
import type { VueSimulatorRenderer } from '../interface';
import { host } from '../host';
import { useCodesInstance } from '../code-impl/code-impl';
import LayoutView from './layout';

function useCssHandler() {
    const css = host.project.get('css') || '';
    let styleDom = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(styleDom);
    styleDom.textContent = css.replace(/\n/g, '');

    const offEvent = host.project.onCssChange(() => {
        styleDom.textContent = host.project.get('css')?.replace(/\n/g, '');
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

        const globalContext: Record<string, any> = reactive({
            $context: host.project.config || {},
        });

        host.project.onConfigChange((config) => {
            globalContext.$context = config || {};
        });

        const globalUtils = buildGlobalUtils(props.simulator.libraryMap, host.project.utils, globalContext);
        globalContext.$utils = globalUtils;
        host.project.updateUtilsInstance(globalUtils);

        initCodesInstance(code.codeMap, globalContext);

        watch(codesInstance, (value) => {
            Object.assign(globalContext, value);
        });

        const offCodeChangedEvent: (() => void)[] = [];
        offCodeChangedEvent.push(
            code.onCodesChanged((currentCodeMap: Map<string, ICodeItem>) => {
                initCodesInstance(currentCodeMap, globalContext);
            }),
            code.onCodeItemAdd((item: ICodeItem) => {
                createCodeInstance(item, globalContext);
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

        // 兼容性处理
        watch([() => globalContext.$context, globalContext.$utils], () => {
            globalContext.letgoContext = globalContext.$context;
            globalContext.utils = globalContext.$utils;
        }, {
            immediate: true,
        });

        provide(BASE_GLOBAL_CONTEXT, globalContext);

        watch(() => props.simulator.libraryUpdate, () => {
            const globalUtils = buildGlobalUtils(props.simulator.libraryMap, host.project.utils, globalContext);
            globalContext.$utils = globalUtils;
            host.project.updateUtilsInstance(globalUtils);
        });

        return () => {
            return (
                <LayoutView simulator={props.simulator}>
                    <RouterView></RouterView>
                </LayoutView>
            );
        };
    },
});
