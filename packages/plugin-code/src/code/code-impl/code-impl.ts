/**
 * TODO 计算状初始化顺序
 */

import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../../constants';
import type { CodeItem } from '../../interface';
import { findExpressionDependencyCode } from './transform-expression';
import { topologicalSort } from './dag';
import { TemporaryStateImpl } from './temporary-state';

export function genCodeDependencies(codeMap: Map<string, CodeItem>) {
    const dependencyMap = new Map<string, string[]>();
    for (const [codeId, item] of codeMap) {
        let dependencies: string[];
        if (item.type === TEMPORARY_STATE) {
            dependencies = findExpressionDependencyCode(item.type, (name: string) => {
                return codeMap.has(name);
            });
        }
        else if (item.type === JAVASCRIPT_COMPUTED) {
            // TODO item.funcBody 计算依赖关系
        }
        else if (item.type === JAVASCRIPT_QUERY) {
            // TODO  item.query 计算依赖关系
        }
        dependencyMap.set(codeId, dependencies);
    }

    const sortResult = topologicalSort(dependencyMap);
    if (sortResult.length < dependencyMap.size) {
        const cycleDep = [...dependencyMap.keys()].filter((codeId) => {
            return !sortResult.includes(codeId);
        });
        throw new Error(`There is a cycle in the dependencies: ${cycleDep.join(',')}.`);
    }

    const codeInstance: Record<string, TemporaryStateImpl> = {};
    // 最底层的依赖最先被实例化
    sortResult.reverse().forEach((codeId) => {
        const item = codeMap.get(codeId);
        if (item.type === TEMPORARY_STATE) {
            codeInstance[codeId] = new TemporaryStateImpl(item, dependencyMap.get(codeId), codeInstance);
        }
        else if (item.type === JAVASCRIPT_COMPUTED) {
            // TODO computed 实例化
        }
        else if (item.type === JAVASCRIPT_QUERY) {
            // TODO  query 实例化
        }
    });

    return codeInstance;
}
