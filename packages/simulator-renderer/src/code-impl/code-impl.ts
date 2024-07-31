import { FMessage } from '@fesjs/fes-design';
import { shallowReactive } from 'vue';
import { isNil } from 'lodash-es';
import type { ICodeItem } from '@webank/letgo-types';
import { IEnumCodeType, isJavascriptComputed, isJavascriptFunction, isVariableState } from '@webank/letgo-types';
import { LogIdType, calcDependencies, sortState } from '@webank/letgo-common';
import { host } from '../host';
import { JavascriptQueryImpl, createQueryImpl } from './query';
import { JavascriptFunctionImpl } from './javascript-function';
import { ComputedImpl } from './computed';
import { TemporaryStateImpl } from './temporary-state';
import { LifecycleHookImpl } from './lifecycle-hook';

export type CodeImplType = ComputedImpl | TemporaryStateImpl | JavascriptFunctionImpl | JavascriptQueryImpl | LifecycleHookImpl;

export function useCodesInstance() {
    const dependencyMap = new Map<string, string[]>();
    let codeMap: Map<string, ICodeItem> = new Map();
    const codesInstance: Record<string, CodeImplType> = shallowReactive({});

    const reportError = (item: ICodeItem, err: unknown) => {
        // variable 改了会立即执行，可以发现语法错误，不需要重复报错
        if (!isVariableState(item)) {
            host.logger.error({
                msg: err,
                id: item.id,
                idType: LogIdType.CODE,
            });
        }
    };

    const createCodeInstance = (item: ICodeItem, ctx: Record<string, any>) => {
        if (!dependencyMap.has(item.id)) {
            dependencyMap.set(item.id, calcDependencies(item, ctx, (err: unknown) => {
                reportError(item, err);
            }));
        }

        if (item.type === IEnumCodeType.TEMPORARY_STATE) {
            codesInstance[item.id] = new TemporaryStateImpl(item, dependencyMap.get(item.id), ctx);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED) {
            codesInstance[item.id] = new ComputedImpl(item, dependencyMap.get(item.id), ctx);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_QUERY) {
            codesInstance[item.id] = createQueryImpl(item, dependencyMap.get(item.id), ctx);
        }
        else if (item.type === IEnumCodeType.JAVASCRIPT_FUNCTION) {
            const instance = new JavascriptFunctionImpl(item, dependencyMap.get(item.id), ctx);
            function proxyFunction(...args: any[]) {
                return instance.trigger(...args);
            }
            codesInstance[item.id] = new Proxy(proxyFunction, {
                get(target, prop, receiver) {
                    return Reflect.get(instance, prop, receiver);
                },
                set(target, prop, value) {
                    return Reflect.set(instance, prop, value);
                },
            }) as unknown as JavascriptFunctionImpl;
        }

        else if (item.type === IEnumCodeType.LIFECYCLE_HOOK) { codesInstance[item.id] = new LifecycleHookImpl(item, dependencyMap.get(item.id), ctx); }
    };

    const deleteCodeInstance = (id: string) => {
        // TODO 如果该 id 被其他地方依赖，需要提示用户手动修改
        dependencyMap.delete(id);
        delete codesInstance[id];
    };

    const changeCodeInstance = (id: string, content: Record<string, any>, ctx: Record<string, any>) => {
        const item = codeMap.get(id);

        if (item.type === IEnumCodeType.JAVASCRIPT_QUERY && content.resourceType && item.resourceType !== content.resourceType)
            codesInstance[item.id] = createQueryImpl(item, dependencyMap.get(item.id), ctx);

        const currentInstance = codesInstance[id];

        if ((isVariableState(item) && !isNil(content.initValue))
            || ((isJavascriptComputed(item)) && !isNil(content.funcBody))
            || (isJavascriptFunction(item) && !isNil(content.funcBody))
            || (currentInstance instanceof JavascriptQueryImpl && !isNil(content.query))
            || (currentInstance instanceof LifecycleHookImpl && !isNil(content.funcBody))
        ) {
            const deps = calcDependencies({ ...item, ...content }, ctx, (err: unknown) => {
                reportError(item, err);
            });
            dependencyMap.set(id, deps);
            currentInstance.changeDeps(deps);
        }
        codesInstance[id].changeContent(content);
    };

    const changeCodeInstanceId = (id: string, preId: string) => {
        dependencyMap.set(id, dependencyMap.get(preId));
        dependencyMap.delete(preId);

        codesInstance[id] = codesInstance[preId];
        codesInstance[id].changeId(id);
        delete codesInstance[preId];
    };

    const initCodesInstance = (currentCodeMap: Map<string, ICodeItem>, ctx: Record<string, any>) => {
        try {
            dependencyMap.clear();
            for (const key of codeMap.keys()) {
                delete ctx[key];
                deleteCodeInstance(key);
            }

            codeMap = currentCodeMap;
            const sortResult = sortState(codeMap, dependencyMap, ctx);
            // 最底层的依赖最先被实例化
            sortResult.forEach((codeId) => {
                const item = codeMap.get(codeId);
                createCodeInstance(item, ctx);
                ctx[item.id] = codesInstance[item.id];
            });
        }
        catch (err) {
            if (err instanceof Error)
                FMessage.error(err.message);
            else
                console.error(err);
        }
    };

    return {
        codesInstance,
        initCodesInstance,
        createCodeInstance,
        deleteCodeInstance,
        changeCodeInstance,
        changeCodeInstanceId,
    };
}
