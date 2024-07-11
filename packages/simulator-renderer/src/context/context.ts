// 构建运行时 context
import { markClassReactive, traverseNodeSchema } from '@webank/letgo-common';
import { inject, reactive, shallowReactive, watch } from 'vue';
import { LetgoPageBase, executeClassPropReactive } from '@webank/letgo-renderer';
import { BASE_GLOBAL_CONTEXT } from '../constants';
import type { DocumentInstance } from '../interface';
import type { CodeImplType } from '../code-impl/code-impl';

function createClassInstance(options: {
    code: string;
    globalContext: Record<string, any>;
    compInstances: Record<string, any>;
    codesInstance: Record<string, any>;
}) {
    // eslint-disable-next-line no-new-func
    const DynamicClass = (new Function('Page', `return (${options.code.trim()})`))(LetgoPageBase);

    return new DynamicClass({
        globalContext: options.globalContext,
        instances: options.compInstances,
        codes: options.codesInstance,
    });
}

export function useContext(codesInstance: Record<string, CodeImplType>, documentInstance: DocumentInstance) {
    const globalContext = inject(BASE_GLOBAL_CONTEXT) as Record<string, any>;

    const executeCtx = shallowReactive({
        ...globalContext,
        ...codesInstance,
    });

    watch(globalContext, (value, oldValue) => {
        Object.keys(oldValue).forEach((key) => {
            if (!value[key])
                delete executeCtx[key];
        });
        Object.assign(executeCtx, globalContext);
    });

    watch(codesInstance, (value) => {
        Object.assign(executeCtx, value);
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

    documentInstance.document.onClassCodeChange(() => {
        const instance = documentInstance.document.classCode
            ? reactive(createClassInstance({
                code: documentInstance.document.classCode,
                globalContext,
                compInstances,
                codesInstance,
            }))
            : null;

        executeCtx.__this = instance
            ? markClassReactive(instance, (member) => {
                return executeClassPropReactive(instance, member);
            })
            : instance;
        codesInstance.this = executeCtx.__this;
    });

    if (documentInstance.schema.classCode) {
        const instance = createClassInstance({
            code: documentInstance.schema.classCode,
            globalContext,
            compInstances,
            codesInstance,
        });
        executeCtx.__this = markClassReactive(instance, (member) => {
            return executeClassPropReactive(instance, member);
        });
        codesInstance.this = executeCtx.__this;
    }

    return {
        executeCtx,
        compInstances,
    };
}
