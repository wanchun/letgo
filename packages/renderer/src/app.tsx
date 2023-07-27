import type { Component, PropType } from 'vue';
import { computed, defineComponent, onMounted, provide, reactive, ref, shallowRef } from 'vue';
import type { IPublicTypeAsset, IPublicTypePageSchema, IPublicTypeProjectSchema } from '@harrywan/letgo-types';
import { AssetLoader, buildComponents } from '@harrywan/letgo-common';
import { Renderer } from './renderer';
import { JavascriptFunctionLive } from './code-impl';
import { buildGlobalUtils } from './parse';
import { useCodesInstance } from './code-impl/code-impl';
import type { CodeImplType } from './code-impl/code-impl';
import { getGlobalContextKey } from './context';

function useCssHandler(css?: string) {
    if (css) {
        const styleDom = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(styleDom);
        styleDom.innerText = css.replace(/\n/g, '');
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
        useCssHandler(props.projectSchema.css);

        const {
            componentsMap: componentsMapArray,
            packages = [],
        } = props.projectSchema;

        const libraryAsset: IPublicTypeAsset = props.assets;

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

        onMounted(async () => {
            const assetLoader = new AssetLoader();
            await assetLoader.load(libraryAsset);

            components.value = buildComponents(
                libraryMap,
                componentsMap,
            );

            isReady.value = true;
        });

        const globalContext: Record<string, any> = reactive({
            letgoContext: props.projectSchema.config || {},
            utils: buildGlobalUtils(libraryMap, props.projectSchema.utils),
        });

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

        provide(getGlobalContextKey(), globalContext);

        return () => {
            if (!isReady.value)
                return slots.loading?.();
            return <Renderer schema={props.pageSchema} components={components.value}></Renderer>;
        };
    },
});
