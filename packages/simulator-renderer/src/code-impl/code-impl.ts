import { FMessage } from '@fesjs/fes-design';
import { reactive } from 'vue';
import { isNil } from 'lodash-es';
import { generate } from 'astring';
import type { CodeItem } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';
import type { CodeImplType } from '@webank/letgo-designer';
import { extractExpression, replaceExpression } from './helper';
import { findExpressionDependencyCode, transformExpression } from './transform-expression';
import { topologicalSort } from './dag';
import { TemporaryStateImpl } from './temporary-state';
import { ComputedImpl } from './computed';
import { JavascriptQueryImpl } from './javascript-query';

// javascript query 由于过于复杂，不计算依赖关系
function calcDependencies(item: CodeItem, codeMap: Map<string, CodeItem>) {
    let dependencies: string[] = [];
    let inputCode: string;
    if (item.type === CodeType.TEMPORARY_STATE)
        inputCode = item.initValue;
    else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
        inputCode = item.funcBody;

    if (inputCode) {
        extractExpression(inputCode).forEach((expression) => {
            dependencies = dependencies.concat(findExpressionDependencyCode(expression, (name: string) => {
                return codeMap.has(name);
            }));
        });
    }

    return dependencies;
}

// TODO 修改 change id

export function useCodesInstance(codeMap: Map<string, CodeItem>) {
    const dependencyMap = new Map<string, string[]>();
    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, codeMap));

    const codesInstance: Record<string, CodeImplType> = reactive({});

    const checkCycleDependency = () => {
        const sortResult = topologicalSort(dependencyMap);
        if (sortResult.length < dependencyMap.size) {
            const cycleDep = [...dependencyMap.keys()].filter((codeId) => {
                return !sortResult.includes(codeId);
            });
            throw new Error(`There is a cycle in the dependencies: ${cycleDep.join(',')}.`);
        }
        return sortResult;
    };

    const createCodeInstance = (item: CodeItem, ctx: Record<string, any>) => {
        if (!dependencyMap.has(item.id))
            dependencyMap.set(item.id, calcDependencies(item, codeMap));

        if (item.type === CodeType.TEMPORARY_STATE)
            codesInstance[item.id] = new TemporaryStateImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
            codesInstance[item.id] = new ComputedImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_QUERY)
            codesInstance[item.id] = new JavascriptQueryImpl(item, ctx);
    };

    const deleteCodeInstance = (id: string) => {
        // TODO 如果该 id 被其他地方依赖，需要提示用户手动修改
        dependencyMap.delete(id);
        delete codesInstance[id];
    };

    const changeCodeInstance = (id: string, content: Record<string, any>) => {
        const item = codeMap.get(id);
        const currentInstance = codesInstance[id];

        if ((currentInstance instanceof TemporaryStateImpl && !isNil(content.initValue)) || (currentInstance instanceof ComputedImpl && !isNil(content.funcBody))) {
            const deps = calcDependencies(item, codeMap);
            dependencyMap.set(id, deps);
            currentInstance.changeDeps(deps);
        }

        codesInstance[id].changeContent(content);

        if (currentInstance instanceof TemporaryStateImpl && !isNil(content.initValue)) {
            for (const [key, deps] of dependencyMap) {
                if (deps.includes(id) && codesInstance[key] instanceof TemporaryStateImpl)
                    (codesInstance[key] as TemporaryStateImpl).recalculateValue();
            }
        }
    };

    const changeCodeInstanceId = (id: string, preId: string) => {
        dependencyMap.set(id, dependencyMap.get(id));
        codesInstance[id] = codesInstance[preId];
        codesInstance[id].changeId(id);
        const item = codeMap.get(id);

        for (const [_, deps] of dependencyMap) {
            if (deps.includes(preId)) {
                if (item.type === CodeType.TEMPORARY_STATE) {
                    replaceExpression(item.initValue, (_, expression) => {
                        const ast = transformExpression(expression, (identity) => {
                            if (identity.name === preId)
                                identity.name = id;
                        });
                        return `\${${generate(ast)}`;
                    });
                }
                // TODO 改其他类型
            }
        }
    };

    const initCodesInstance = (ctx: Record<string, any>) => {
        try {
            const sortResult = checkCycleDependency();
            // 最底层的依赖最先被实例化
            sortResult.reverse().forEach((codeId) => {
                const item = codeMap.get(codeId);
                createCodeInstance(item, ctx);
            });
        }
        catch (err) {
            if (err instanceof Error)
                FMessage.error(err.message);
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
