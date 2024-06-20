import type { IPlugin } from '../types';

interface TaskList { [name: string]: IPlugin }

interface SequenceResult {
    sequence: string[]
    missingTasks: string[]
    recursiveDependencies: string[][]
}

function sequence(
    tasks: TaskList,
    names: string[],
    results: string[],
    missing: string[],
    recursive: string[][],
    nest: string[],
) {
    names.forEach((name) => {
        if (results.includes(name))
            return; // de-dup results

        const node = tasks[name];
        if (!node) {
            missing.push(name);
        }
        else if (nest.includes(name)) {
            nest.push(name);
            recursive.push(nest.slice(0));
            nest.pop();
        }
        else if (node.dep.length) {
            nest.push(name);
            sequence(tasks, node.dep, results, missing, recursive, nest); // recurse
            nest.pop();
        }
        results.push(name);
    });
}

// tasks: object with keys as task names
// names: array of task names
export default function tasksSequence(tasks: TaskList, names: string[]): SequenceResult {
    let results: string[] = []; // the final sequence
    const missing: string[] = []; // missing tasks
    const recursive: string[][] = []; // recursive task dependencies

    sequence(tasks, names, results, missing, recursive, []);

    if (missing.length || recursive.length)
        results = []; // results are incomplete at best, completely wrong at worst, remove them to avoid confusion

    return {
        sequence: results,
        missingTasks: missing,
        recursiveDependencies: recursive,
    };
}
