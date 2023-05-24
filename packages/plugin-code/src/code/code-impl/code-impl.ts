import { FMessage } from '@fesjs/fes-design';
import { reactive } from 'vue';
import { isNil } from 'lodash-es';
import { generate } from 'astring';
import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../../constants';
import type { CodeItem } from '../../interface';
import { extractExpression, replaceExpression } from '../../helper';
import { findExpressionDependencyCode, transformExpression } from './transform-expression';
import { topologicalSort } from './dag';
import { TemporaryStateImpl } from './temporary-state';
import { ComputedImpl } from './computed';

// javascript query 由于过于复杂，不计算依赖关系
function calcDependencies(item: CodeItem, codeMap: Map<string, CodeItem>) {
    let dependencies: string[] = [];
    let inputCode: string;
    if (item.type === TEMPORARY_STATE)
        inputCode = item.initValue;
    else if (item.type === JAVASCRIPT_COMPUTED)
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

export function useCodeInstance(codeMap: Map<string, CodeItem>) {
    const dependencyMap = new Map<string, string[]>();
    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, codeMap));

    const codeInstances: Record<string, TemporaryStateImpl | ComputedImpl> = reactive({});

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

    const createCodeInstance = (item: CodeItem) => {
        if (!dependencyMap.has(item.id))
            dependencyMap.set(item.id, calcDependencies(item, codeMap));

        if (item.type === TEMPORARY_STATE) {
            codeInstances[item.id] = new TemporaryStateImpl(item, dependencyMap.get(item.id), codeInstances);
        }
        else if (item.type === JAVASCRIPT_COMPUTED) {
            codeInstances[item.id] = new ComputedImpl(item, dependencyMap.get(item.id), codeInstances);
        }
        else if (item.type === JAVASCRIPT_QUERY) {
            // TODO  query 实例化
        }
    };

    const deleteCodeInstance = (id: string) => {
        // TODO 如果该 id 被其他地方以来到，需要提示用户手动修改
        dependencyMap.delete(id);
        delete codeInstances[id];
    };

    const isChangeCode = (item: CodeItem, content: Record<string, any>) => {
        if ((item.type === TEMPORARY_STATE && !isNil(content.initValue)) || (item.type === JAVASCRIPT_COMPUTED && !isNil(content.funcBody)) || (item.type === JAVASCRIPT_QUERY && !isNil(content.query)))
            return true;

        return false;
    };

    const changeCodeInstance = (id: string, content: Record<string, any>) => {
        const item = codeMap.get(id);
        if (isChangeCode(item, content)) {
            const deps = calcDependencies(item, codeMap);
            dependencyMap.set(id, deps);
            codeInstances[id].changeDeps(deps);
        }

        codeInstances[id].changeContent(content);

        for (const [key, deps] of dependencyMap) {
            if (deps.includes(id))
                codeInstances[key].recalculateValue();
        }
    };

    const changeCodeInstanceId = (id: string, preId: string) => {
        dependencyMap.set(id, dependencyMap.get(id));
        codeInstances[id] = codeInstances[preId];
        codeInstances[id].changeId(id);
        const item = codeMap.get(id);

        for (const [_, deps] of dependencyMap) {
            if (deps.includes(preId)) {
                if (item.type === TEMPORARY_STATE) {
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

    const init = () => {
        try {
            const sortResult = checkCycleDependency();
            // 最底层的依赖最先被实例化
            sortResult.reverse().forEach((codeId) => {
                const item = codeMap.get(codeId);
                createCodeInstance(item);
            });
        }
        catch (err) {
            if (err instanceof Error)
                FMessage.error(err.message);
        }
    };
    init();

    return {
        codeInstances,

        createCodeInstance,
        deleteCodeInstance,
        changeCodeInstance,
        changeCodeInstanceId,
    };
}
