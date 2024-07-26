// 构建运行时 context
import { traverseNodeSchema } from '@webank/letgo-common';
import { inject, shallowReactive, watch } from 'vue';
import { LetgoPageBase } from '@webank/letgo-renderer';
import { BASE_GLOBAL_CONTEXT } from '../constants';
import type { DocumentInstance } from '../interface';
import type { CodeImplType } from '../code-impl/code-impl';
import { ProxyClass } from './proxy-class';

function createClassInstance(options: {
    code: string;
    globalContext: Record<string, any>;
    compInstances: Record<string, any>;
    codesInstance: Record<string, any>;
}) {
    try {
        // eslint-disable-next-line no-new-func
        const DynamicClass = (new Function('Page', `${options.code.trim()}\n return Main;`))(LetgoPageBase);

        return new DynamicClass({
            globalContext: options.globalContext,
            instances: options.compInstances,
            codes: options.codesInstance,
        });
    }
    catch (err) {
        console.warn('Class Code 实例化失败');
        console.error(err);
        return null;
    }
}

export function useContext(codesInstance: Record<string, CodeImplType>, documentInstance: DocumentInstance) {
    const globalContext = inject(BASE_GLOBAL_CONTEXT) as Record<string, any>;

    const executeCtx = {
        ...globalContext,
        ...codesInstance,
    };

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

    const proxyClass = new ProxyClass();

    documentInstance.document.onClassCodeChange(() => {
        const instance = documentInstance.document.classCode && createClassInstance({
            code: documentInstance.document.classCode,
            globalContext,
            compInstances,
            codesInstance,
        });
        if (instance) {
            proxyClass.changeTarget(instance);
            codesInstance.this = instance;
        }
    });

    if (documentInstance.schema.classCode) {
        const instance = createClassInstance({
            code: documentInstance.schema.classCode,
            globalContext,
            compInstances,
            codesInstance,
        });
        if (instance) {
            proxyClass.changeTarget(instance);
            codesInstance.this = instance;
        }
    }
    executeCtx.__this = proxyClass.getThisProxy();

    return {
        executeCtx,
        compInstances,
    };
}
