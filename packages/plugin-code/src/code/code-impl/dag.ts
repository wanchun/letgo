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
