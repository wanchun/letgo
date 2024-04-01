import type { IPublicTypeNodeSchema, IPublicTypePageSchema, IPublicTypeRootSchema } from '@webank/letgo-types';
import { cloneDeep, isEqual, omit } from 'lodash-es';
import { traverseNodeSchema } from '../traverse-schema';
import { DiffType } from '../diff/diff-types';
import type { CodeConflict } from './merge-types';

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
 *
 * TODO 拓展冲突节点
 * 3. 一个修改，一个删除也算冲突
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
    baseNodeMap,
    currentNodeMap,
    nextNodeMap,

    baseSchema,
    currentSchema,
    nextSchema,
}: {
    baseNodeMap: Map<string, IPublicTypeNodeSchema>;
    currentNodeMap: Map<string, IPublicTypeNodeSchema>;
    nextNodeMap: Map<string, IPublicTypeNodeSchema>;

    baseSchema: IPublicTypePageSchema;
    currentSchema: IPublicTypePageSchema;
    nextSchema: IPublicTypePageSchema;
}): IPublicTypePageSchema {
    // TODO merge
    const resultSchema = cloneDeep(currentSchema);
    Object.assign(resultSchema, {
        fileName: nextSchema.fileName,
        css: nextSchema.css,
    });
}

export function mergePageSchema(baseSchema: IPublicTypePageSchema, currentSchema: IPublicTypePageSchema, nextSchema: IPublicTypePageSchema) {
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
    if (nodeModifyConflict.size === 0) {
        mergedPageSchema = handlePageSchemaMerged({
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
