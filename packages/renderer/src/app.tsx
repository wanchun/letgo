import type { Component, PropType } from 'vue';
import { computed, defineComponent, onMounted, provide, reactive, ref, shallowRef, watch } from 'vue';
import { IEnumCodeType, IPublicEnumProjectLifecycle } from '@webank/letgo-types';
import type { IPublicTypeAsset, IPublicTypePageSchema, IPublicTypeProjectSchema } from '@webank/letgo-types';
import { AssetLoader, buildComponents } from '@webank/letgo-common';
import { builtinComponents } from '@webank/letgo-components';
import { Renderer } from './renderer';
import { JavascriptFunctionLive } from './code-impl';
import { buildGlobalUtils } from './parse';
import { useCodesInstance } from './code-impl/code-impl';
import type { CodeImplType } from './code-impl/code-impl';
import { getGlobalContextKey } from './context';
import { request } from './utils/request';
import { createComponent } from './create-component';

function useCssHandler(css?: string) {
    if (css) {
        const styleDom = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(styleDom);
        styleDom.textContent = css.replace(/\n/g, '');
    }
}

export const RendererApp = defineComponent({
    name: 'RendererApp',
    props: {
        assets: {
            type: Array as PropType<IPublicTypeAsset[]>,
            default() {
                return [];
            },
        },
        projectSchema: {
            type: Object as PropType<IPublicTypeProjectSchema>,
            required: true,
        },
        pageSchema: {
            type: Object as PropType<IPublicTypePageSchema>,
            required: true,
        },
    },
    setup(props, { slots }) {
        if (!window.letgoRequest)
            window.letgoRequest = request as typeof window.letgoRequest;

        useCssHandler(props.projectSchema.css);

        const {
            componentsMap: componentsMapArray,
            packages = [],
        } = props.projectSchema;

        const libraryAsset: IPublicTypeAsset = [...props.assets];

        const componentsMap: any = {};
        const libraryMap: Record<string, string> = {};
        const components = shallowRef<Record<string, Component>>({});
        const isReady = ref(false);

        componentsMapArray.forEach((component: any) => {
            componentsMap[component.componentName] = component;
        });

        packages.forEach(({ package: _package, library, urls }) => {
            libraryMap[_package] = library;
            if (urls)
                libraryAsset.push(urls);
        });

        const globalContext: Record<string, any> = reactive({
            $context: props.projectSchema.config || {},
            $utils: {},
        });

        // 兼容性处理
        globalContext.letgoContext = globalContext.$context;
        globalContext.utils = globalContext.$utils;

        useCodesInstance({
            executeCtx: globalContext,
            codeStruct: computed(() => props.projectSchema.code),
            onSet(key: string, value: CodeImplType) {
                if (value instanceof JavascriptFunctionLive)
                    globalContext[key] = value.trigger.bind(value);

                else
                    globalContext[key] = value;
            },
            onClear(keys: string[]) {
                keys.forEach((key) => {
                    delete globalContext[key];
                });
            },
        });

        onMounted(async () => {
            const assetLoader = new AssetLoader();
            await assetLoader.load(libraryAsset);

            components.value = {
                ...builtinComponents,
                ...buildComponents(
                    libraryMap,
                    componentsMap,
                    createComponent,
                ),
            };

            globalContext.$utils = buildGlobalUtils(libraryMap, props.projectSchema.utils, globalContext);

            await Promise.all(Object.keys(globalContext).map(async (id) => {
                const ins = globalContext[id];
                if (ins?.type === IEnumCodeType.LIFECYCLE_HOOK) {
                    if (ins.hookName === IPublicEnumProjectLifecycle.BeforeRender)
                        await ins.run();
                }
            }));

            isReady.value = true;
        });

        provide(getGlobalContextKey(), globalContext);

        return () => {
            if (!isReady.value)
                return slots.loading?.();
            return <Renderer schema={props.pageSchema} components={components.value}></Renderer>;
        };
    },
});
