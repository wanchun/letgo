import type { CodeItem } from '@webank/letgo-types';
import { calcDependencies } from './ast';

export function topologicalSort(dependencyMap: Map<string, string[]>) {
    const indegree = new Map();
    for (const [_, deps] of dependencyMap) {
        for (const dep of deps)
            indegree.set(dep, (indegree.get(dep) ?? 0) + 1);
    }

    const queue = [];
    for (const [name] of dependencyMap) {
        if (!indegree.has(name))
            queue.push(name);
    }

    const result = [];
    while (queue.length) {
        const cur = queue.shift();
        result.push(cur);
        const deps = dependencyMap.get(cur);
        for (const dep of deps) {
            indegree.set(dep, indegree.get(dep) - 1);
            if (indegree.get(dep) === 0)
                queue.push(dep);
        }
    }
    return result;
}

export function checkCycleDependency(dependencyMap: Map<string, string[]>) {
    const sortResult = topologicalSort(dependencyMap);
    if (sortResult.length < dependencyMap.size) {
        const cycleDep = [...dependencyMap.keys()].filter((codeId) => {
            return !sortResult.includes(codeId);
        });
        throw new Error(`There is a cycle in the dependencies: ${cycleDep.join(',')}.`);
    }
    return sortResult;
}

export function sortState(codeMap: Map<string, CodeItem>, dependencyMap = new Map<string, string[]>(), ctx?: Record<string, any>) {
    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, ctx));

    const sortResult = checkCycleDependency(dependencyMap);
    // 最底层的依赖最先被实例化
    return sortResult.reverse();
}
