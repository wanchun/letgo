import { FMessage } from '@fesjs/fes-design';
import { reactive } from 'vue';
import { isNil } from 'lodash-es';
import type { CodeItem } from '@harrywan/letgo-types';
import { CodeType } from '@harrywan/letgo-types';
import { type CodeImplType } from '@harrywan/letgo-designer';
import { ComputedImpl, JavascriptFunctionImpl, JavascriptQueryImpl } from '@harrywan/letgo-renderer';
import { calcDependencies, sortState } from '@harrywan/letgo-common';
import { SimulatorTemporaryState } from './temporary-state';

export function useCodesInstance() {
    const dependencyMap = new Map<string, string[]>();
    let codeMap: Map<string, CodeItem> = new Map();
    const codesInstance: Record<string, CodeImplType> = reactive({});

    const createCodeInstance = (item: CodeItem, ctx: Record<string, any>) => {
        if (!dependencyMap.has(item.id))
            dependencyMap.set(item.id, calcDependencies(item, ctx));

        if (item.type === CodeType.TEMPORARY_STATE)
            codesInstance[item.id] = new SimulatorTemporaryState(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
            codesInstance[item.id] = new ComputedImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_QUERY)
            codesInstance[item.id] = new JavascriptQueryImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_FUNCTION)
            codesInstance[item.id] = new JavascriptFunctionImpl(item, dependencyMap.get(item.id), ctx);
    };

    const deleteCodeInstance = (id: string) => {
        // TODO 如果该 id 被其他地方依赖，需要提示用户手动修改
        dependencyMap.delete(id);
        delete codesInstance[id];
    };

    const changeCodeInstance = (id: string, content: Record<string, any>, ctx: Record<string, any>) => {
        const item = codeMap.get(id);
        const currentInstance = codesInstance[id];

        if ((currentInstance instanceof SimulatorTemporaryState && !isNil(content.initValue))
            || (currentInstance instanceof ComputedImpl && !isNil(content.funcBody))
            || (currentInstance instanceof JavascriptFunctionImpl && !isNil(content.funcBody))
            || (currentInstance instanceof JavascriptQueryImpl && !isNil(content.query))
        ) {
            const deps = calcDependencies(item, ctx);
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

    const initCodesInstance = (currentCodeMap: Map<string, CodeItem>, ctx: Record<string, any>) => {
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
                Object.keys(codesInstance).forEach((key) => {
                    if (codesInstance[key].type === CodeType.JAVASCRIPT_FUNCTION)
                        ctx[key] = (codesInstance[key] as JavascriptFunctionImpl).trigger;

                    else
                        ctx[key] = codesInstance[key];
                });
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
