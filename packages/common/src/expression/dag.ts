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