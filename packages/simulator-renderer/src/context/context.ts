// 构建运行时 context
import { traverseNodeSchema } from '@webank/letgo-common';
import { inject, reactive, shallowReactive, watch } from 'vue';
import { LetgoPageBase } from '@webank/letgo-renderer';
import { BASE_GLOBAL_CONTEXT } from '../constants';
import type { DocumentInstance } from '../interface';
import type { CodeImplType } from '../code-impl/code-impl';
import { JavascriptFunctionImpl } from '../code-impl/javascript-function';

export function useContext(codesInstance: Record<string, CodeImplType>, documentInstance: DocumentInstance) {
    const globalContext = inject(BASE_GLOBAL_CONTEXT) as Record<string, any>;

    const executeCtx = Object.assign({ ...globalContext }, codesInstance);

    watch(globalContext, (value, oldValue) => {
        Object.keys(oldValue).forEach((key) => {
            if (!value[key])
                delete executeCtx[key];
        });
        Object.assign(executeCtx, globalContext);
    });

    watch(codesInstance, (value) => {
        Object.keys(value).forEach((key) => {
            const item = value[key];
            if (item instanceof JavascriptFunctionImpl)
                executeCtx[key] = item.trigger.bind(value[key]);
            else
                executeCtx[key] = item;
        });
    });

    const compInstances = shallowReactive<Record<string, any>>({});

    if (documentInstance.schema?.children) {
        traverseNodeSchema(documentInstance.schema.children, (item) => {
            if (item.loop)
                compInstances[item.ref] = [];

            else
                compInstances[item.ref] = {};
        });
    }

    watch(compInstances, () => {
        Object.assign(executeCtx, compInstances);
    }, {
        immediate: true,
    });

    if (documentInstance.schema.classCode) {
        // eslint-disable-next-line no-new-func
        const DynamicClass = (new Function('Component', `return ${documentInstance.schema.classCode.trim()}`))(LetgoPageBase);

        const instance = new DynamicClass({
            globalContext,
            instances: compInstances,
            codes: codesInstance,
        });

        executeCtx.__this = reactive(instance);
    }

    return {
        executeCtx,
        compInstances,
    };
}
