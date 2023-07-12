import type { PropType } from 'vue';
import { computed, defineComponent, provide, reactive } from 'vue';
import type { IPublicTypeProjectSchema } from '@harrywan/letgo-types';
import type { CodeImplType } from '@harrywan/letgo-designer';
import { getGlobalContextKey } from '../context';

import { useCodesInstance } from '../code-impl/code-impl';
import { JavascriptFunctionImpl } from '../code-impl';
import { buildGlobalUtils } from '../parse';

function useCssHandler(css?: string) {
    if (css) {
        const styleDom = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(styleDom);
        styleDom.innerText = css.replace(/\n/g, '');
    }
}

export default defineComponent({
    name: 'RendererApp',
    props: {
        libraryMap: Object as PropType<Record<string, any>>,
        projectSchema: Object as PropType<IPublicTypeProjectSchema>,
    },
    setup(props, { slots }) {
        useCssHandler(props.projectSchema.css);

        const globalContext: Record<string, any> = reactive({
            letgoContext: props.projectSchema.config || {},
            utils: buildGlobalUtils(props.libraryMap as Record<string, any>, props.projectSchema.utils),
        });

        useCodesInstance({
            executeCtx: globalContext,
            codeStruct: computed(() => props.projectSchema.code),
            onSet(key: string, value: CodeImplType) {
                if (value instanceof JavascriptFunctionImpl)
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
            return slots.default?.();
        };
    },
});
