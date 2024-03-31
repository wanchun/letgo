import type { ICodeItem, ICodeStruct, IEnumCodeType, IPublicTypeNodeSchema, IPublicTypePageSchema, IPublicTypeRootSchema } from '@webank/letgo-types';
import { isEqual, omit } from 'lodash-es';
import { traverseNodeSchema } from './traverse-schema';

enum DiffType {
    Added = 'added',
    Updated = 'updated',
    Delete = 'deleted',
}

interface CodeDiff {
    key: string;
    id: string;
    type: IEnumCodeType;
    diffType: DiffType;
    nextId?: string;
}

function genCodeMap(code: ICodeStruct) {
    const codeMap = new Map<string, ICodeItem>();
    if (code) {
        code.code?.forEach((item) => {
            codeMap.set(item.key, item);
        });

        code.directories?.forEach((directory) => {
            directory.code.forEach((item) => {
                codeMap.set(item.key, item);
            });
        });
    }
    return codeMap;
}

function calcCodeModify(baseCodeMap: Map<string, ICodeItem>, targetCodeMap: Map<string, ICodeItem>) {
    const diffResult = new Map<string, CodeDiff>();

    for (const [key, value] of baseCodeMap) {
        const targetCodeItem = targetCodeMap.get(key);
        if (!targetCodeItem) {
            diffResult.set(key, {
                key,
                id: value.id,
                type: value.type,
                diffType: DiffType.Delete,
            });
        }
        else if (!isEqual(value, targetCodeItem)) {
            diffResult.set(key, {
                key,
                id: value.id,
                type: value.type,
                nextId: targetCodeItem.id !== value.id ? targetCodeItem.id : undefined,
                diffType: DiffType.Updated,
            });
        }
    }

    for (const [key, value] of targetCodeMap) {
        if (!baseCodeMap.has(key)) {
            diffResult.set(key, {
                key,
                id: value.id,
                type: value.type,
                diffType: DiffType.Added,
            });
        }
    }

    return diffResult;
}

function getCodeId(codeDiff: CodeDiff, diffMap: Map<string, CodeDiff>) {
    for (const [_, value] of diffMap) {
        if (value.id === codeDiff.id && value.type === codeDiff.type && value.diffType === DiffType.Added)
            return value;
    }
    return null;
}

interface CodeConflict {
    key: string;
    id: string;
    diffType: DiffType;
    currentCode?: ICodeItem;
    currentNode?: IPublicTypeNodeSchema;
}

/**
 * 判定冲突条件
 * 1. 同时新增了相同的 id，并且类型不一样，类型一样会进行覆盖
 * 2. 同时修改了 id, 并且修改的名字不一样
 */
function getCodeModifyConflict({
    currentDiffMap,
    nextDiffMap,
    currentCodeMap,
}: {
    currentDiffMap: Map<string, CodeDiff>;
    nextDiffMap: Map<string, CodeDiff>;
    currentCodeMap: Map<string, ICodeItem>;
}) {
    const conflictMap = new Map<string, CodeConflict>();

    for (const [key, value] of nextDiffMap) {
        const currentDiff = currentDiffMap.get(key);
        if (currentDiff && currentDiff.diffType === DiffType.Updated && currentDiff.nextId && value.nextId && value.nextId !== currentDiff.nextId) {
            conflictMap.set(key, {
                key,
                id: currentDiff.id,
                diffType: DiffType.Updated,
                currentCode: currentCodeMap.get(key),
            });
        }
        else if (value.diffType === DiffType.Added) {
            const currentDiff = getCodeId(value, currentDiffMap);
            if (currentDiff) {
                conflictMap.set(key, {
                    key,
                    id: currentDiff.id,
                    diffType: DiffType.Updated,
                    currentCode: currentCodeMap.get(currentDiff.key),
                });
            }
        }
    }

    return conflictMap;
}

function genNodeMap(schema: IPublicTypeRootSchema) {
    const nodeMap = new Map<string, IPublicTypeNodeSchema>();
    if (schema.children) {
        traverseNodeSchema(schema.children, (node: IPublicTypeNodeSchema) => {
            nodeMap.set(node.id, node);
        });
    }

    return nodeMap;
}

interface NodeDiff {
    id: string;
    diffType: DiffType;
    ref: string;
    nextRef?: string;
}

function calcNodeModify(baseNodeMap: Map<string, IPublicTypeNodeSchema>, targetNodeMap: Map<string, IPublicTypeNodeSchema>) {
    const diffResult = new Map<string, NodeDiff>();

    for (const [id, value] of baseNodeMap) {
        const targetCodeItem = targetNodeMap.get(id);
        if (!targetCodeItem) {
            diffResult.set(id, {
                id: value.id,
                ref: value.ref,
                diffType: DiffType.Delete,
            });
        }
        else if (!isEqual(omit(value, ['children']), omit(targetCodeItem, 'children'))) {
            diffResult.set(id, {
                id: value.id,
                ref: value.ref,
                nextRef: targetCodeItem.ref !== value.ref ? targetCodeItem.ref : undefined,
                diffType: DiffType.Updated,
            });
        }
    }

    for (const [id, value] of targetNodeMap) {
        if (!baseNodeMap.has(id)) {
            diffResult.set(id, {
                id: value.id,
                ref: value.ref,
                diffType: DiffType.Added,
            });
        }
    }

    return diffResult;
}

function getNodeRef(nodeDiff: NodeDiff, diffMap: Map<string, NodeDiff>) {
    for (const [_, value] of diffMap) {
        if (value.ref === nodeDiff.ref && value.diffType === DiffType.Added)
            return value;
    }
    return null;
}

/**
 * 判定冲突的条件
 * 1. 同时新增了相同 ref Node
 * 2. 修改了同一个 node 的 ref，并且修改结果不一致
 */
function getNodeModifyConflict({
    currentDiffMap,
    nextDiffMap,
    currentNodeMap,
}: {
    currentDiffMap: Map<string, NodeDiff>;
    nextDiffMap: Map<string, NodeDiff>;
    currentNodeMap: Map<string, IPublicTypeNodeSchema>;
}) {
    const conflictMap = new Map<string, CodeConflict>();

    for (const [key, value] of nextDiffMap) {
        const currentDiff = currentDiffMap.get(key);
        if (currentDiff && currentDiff.diffType === DiffType.Updated && currentDiff.nextRef && value.nextRef && value.nextRef !== currentDiff.ref) {
            conflictMap.set(key, {
                key,
                id: currentDiff.id,
                diffType: DiffType.Updated,
                currentNode: currentNodeMap.get(key),
            });
        }
        else if (value.diffType === DiffType.Added) {
            const currentDiff = getNodeRef(value, currentDiffMap);
            if (currentDiff) {
                conflictMap.set(key, {
                    key,
                    id: currentDiff.id,
                    diffType: DiffType.Updated,
                    currentNode: currentNodeMap.get(currentDiff.id),
                });
            }
        }
    }

    return conflictMap;
}

function handlePageSchemaMerged({
    baseCodeMap,
    currentCodeMap,
    nextCodeMap,

    baseNodeMap,
    currentNodeMap,
    nextNodeMap,

    baseSchema,
    currentSchema,
    nextSchema,
}: {
    baseCodeMap: Map<string, ICodeItem>;
    currentCodeMap: Map<string, ICodeItem>;
    nextCodeMap: Map<string, ICodeItem>;

    baseNodeMap: Map<string, IPublicTypeNodeSchema>;
    currentNodeMap: Map<string, IPublicTypeNodeSchema>;
    nextNodeMap: Map<string, IPublicTypeNodeSchema>;

    baseSchema: IPublicTypePageSchema;
    currentSchema: IPublicTypePageSchema;
    nextSchema: IPublicTypePageSchema;
}): IPublicTypePageSchema {
    // TODO merge
}

export function mergePageSchema(baseSchema: IPublicTypePageSchema, currentSchema: IPublicTypePageSchema, nextSchema: IPublicTypePageSchema) {
    const baseCodeMap = genCodeMap(baseSchema.code);
    const currentCodeMap = genCodeMap(currentSchema.code);
    const nextCodeMap = genCodeMap(nextSchema.code);

    const currentCodeDiff = calcCodeModify(baseCodeMap, currentCodeMap);
    const nextCodeDiff = calcCodeModify(baseCodeMap, nextCodeMap);
    const codeModifyConflict = getCodeModifyConflict({
        currentDiffMap: currentCodeDiff,
        nextDiffMap: nextCodeDiff,
        currentCodeMap,
    });

    const baseNodeMap = genNodeMap(baseSchema);
    const currentNodeMap = genNodeMap(currentSchema);
    const nextNodeMap = genNodeMap(nextSchema);

    const currentNodeDiff = calcNodeModify(baseNodeMap, currentNodeMap);
    const nextNodeDiff = calcNodeModify(baseNodeMap, nextNodeMap);
    const nodeModifyConflict = getNodeModifyConflict({
        currentDiffMap: currentNodeDiff,
        nextDiffMap: nextNodeDiff,
        currentNodeMap,
    });

    let isConflict: boolean = false;
    let mergedPageSchema: IPublicTypePageSchema;
    // 没有冲突，进行 merge
    if (codeModifyConflict.size === 0 && nodeModifyConflict.size === 0) {
        mergedPageSchema = handlePageSchemaMerged({
            baseCodeMap,
            currentCodeMap,
            nextCodeMap,

            baseNodeMap,
            currentNodeMap,
            nextNodeMap,

            baseSchema,
            currentSchema,
            nextSchema,
        });
    }
    else {
        isConflict = true;
    }

    return {
        isConflict,
        codeModifyConflict,
        nodeModifyConflict,
        mergedPageSchema,
    };
}
