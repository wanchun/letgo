import type {
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import {
    isJSSlot,
    isNodeSchema,
} from '@webank/letgo-types';
import type { ImportSource } from './types';
import { ImportType } from './types';

export function genSingleImport(imports: ImportSource[]) {
    if (!imports.length)
        return '';
    const source = imports[0].source;
    const importNames = new Set<string>();
    let defaultImport: string;
    for (const imp of imports) {
        if (imp.type === ImportType.ImportDefaultSpecifier)
            defaultImport = imp.alias || imp.imported;

        else if (imp.alias && imp.alias !== imp.imported)
            importNames.add(`${imp.imported} as ${imp.alias}`);

        else
            importNames.add(imp.imported);
    }

    if (defaultImport && importNames.size)
        return `import ${defaultImport}} from '${source}';`;

    if (!defaultImport && importNames.size) {
        return `import {${Array.from(importNames).join(
            ', ',
        )}} from '${source}';`;
    }
    return `import ${defaultImport}, {${Array.from(importNames).join(
        ', ',
    )}} from '${source}';`;
}

export function genImportCode(imports: ImportSource[]) {
    const sourceSet = new Set<string>();
    const categorizeImports = new Map<string, ImportSource[]>();

    for (const imp of imports) {
        sourceSet.add(imp.source);
        if (categorizeImports.has(imp.source))
            categorizeImports.get(imp.source).push(imp);

        else
            categorizeImports.set(imp.source, [imp]);
    }

    const sortedSource = Array.from(sourceSet)
        .map((item) => {
            if (/^[a-zA-Z]/.test(item)) {
                return {
                    source: item,
                    priority: 1,
                };
            }
            if (/^@[a-zA-Z]+/.test(item)) {
                return {
                    source: item,
                    priority: 2,
                };
            }
            if (/^@\//.test(item)) {
                return {
                    source: item,
                    priority: 3,
                };
            }
            return {
                source: item,
                priority: 4,
            };
        })
        .sort(
            (
                a: { source: string; priority: number },
                b: { source: string; priority: number },
            ) => {
                return a.priority - b.priority;
            },
        )
        .map((item) => {
            return item.source;
        });
    const result: string[] = [];
    for (const source of sortedSource)
        result.push(genSingleImport(categorizeImports.get(source)));

    return result.join('\n');
}

export function traverseNodeSchema(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
    callback: (schema: IPublicTypeNodeSchema) => void,
) {
    if (Array.isArray(nodeData)) {
        nodeData.forEach((item) => {
            if (isNodeSchema(item)) {
                callback(item);
                if (item.props.children) {
                    if (Array.isArray(item.props.children))
                        traverseNodeSchema(item.props.children, callback);

                    else
                        traverseNodeSchema([item.props.children], callback);
                }
                if (item.children)
                    traverseNodeSchema(item.children, callback);
            }
            else if (isJSSlot(item)) {
                traverseNodeSchema(
                    Array.isArray(item.value) ? item.value : [item.value],
                    callback,
                );
            }
        });
    }
    else if (isNodeSchema(nodeData)) {
        callback(nodeData);
        if (nodeData.children)
            traverseNodeSchema(nodeData.children, callback);
    }
}