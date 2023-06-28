import type { PropType } from 'vue';
import { computed, defineComponent, provide, reactive } from 'vue';
import type { IPublicTypeProjectSchema } from '@webank/letgo-types';
import type { CodeImplType } from '@webank/letgo-designer';
import { getGlobalContextKey } from '../context';

import { useCodesInstance } from '../code-impl/code-impl';

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
        projectSchema: Object as PropType<IPublicTypeProjectSchema>,
    },
    setup(props, { slots }) {
        useCssHandler(props.projectSchema.css);

        const globalContext: Record<string, any> = reactive({
            letgoContext: props.projectSchema.config || {},
        });

        useCodesInstance({
            codeStruct: computed(() => props.projectSchema.code),
            onSet(key: string, value: CodeImplType) {
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
