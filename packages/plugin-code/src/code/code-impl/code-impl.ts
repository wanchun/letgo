/**
 * TODO 计算状初始化顺序
 */

import { FMessage } from '@fesjs/fes-design';
import { isNil } from 'lodash-es';
import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../../constants';
import type { CodeItem } from '../../interface';
import { extractExpression } from '../../helper';
import { findExpressionDependencyCode } from './transform-expression';
import { topologicalSort } from './dag';
import { TemporaryStateImpl } from './temporary-state';

function calcDependencies(item: CodeItem, codeMap: Map<string, CodeItem>) {
    let dependencies: string[] = [];
    if (item.type === TEMPORARY_STATE) {
        extractExpression(item.initValue).forEach((expression) => {
            dependencies = dependencies.concat(findExpressionDependencyCode(expression, (name: string) => {
                return codeMap.has(name);
            }));
        });
    }
    else if (item.type === JAVASCRIPT_COMPUTED) {
        // TODO computed item.funBody 计算依赖关系
    }
    else if (item.type === JAVASCRIPT_QUERY) {
        // TODO  query item.query 计算依赖关系
    }
    return dependencies;
}

export function useCodeInstance(codeMap: Map<string, CodeItem>) {
    const dependencyMap = new Map<string, string[]>();
    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, codeMap));

    const codeInstances: Record<string, TemporaryStateImpl> = {};

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
            // TODO computed 实例化
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
        if ((item.type === TEMPORARY_STATE && !isNil(content.initValue)) || (item.type === JAVASCRIPT_COMPUTED && !isNil(content.funBody)) || (item.type === JAVASCRIPT_QUERY && !isNil(content.query)))
            return true;

        return false;
    };

    const changeCodeInstance = (id: string, content: Record<string, any>) => {
        const item = codeMap.get(id);
        if (isChangeCode(item, content))
            dependencyMap.set(id, calcDependencies(item, codeMap));

        codeInstances[id].changeContent(content);

        for (const [key, deps] of dependencyMap) {
            if (deps.includes(id))
                codeInstances[key].recalculateValue();
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
    };
}
