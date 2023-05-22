/**
 * TODO 计算状初始化顺序
 */

import { JAVASCRIPT_COMPUTED, JAVASCRIPT_QUERY, TEMPORARY_STATE } from '../../constants';
import type { CodeItem } from '../../interface';
import { findExpressionDependencyCode } from './transform-expression';
import { topologicalSort } from './dag';

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

    // TODO 初始化
}
