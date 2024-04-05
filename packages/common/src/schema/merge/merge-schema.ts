import type { IPublicTypeNodeSchema, IPublicTypePageSchema, IPublicTypeRootSchema } from '@webank/letgo-types';
import { cloneDeep, isEqual } from 'lodash-es';
import { traverseNodeSchema } from '../traverse-schema';
import type { DiffEvent } from '../diff/diff';
import { DiffType, diff } from '../diff/diff';

function genNodeMap(schema: IPublicTypeRootSchema) {
    const nodeMap = new Map<string, IPublicTypeNodeSchema>();
    if (schema.children) {
        traverseNodeSchema(schema.children, (node: IPublicTypeNodeSchema) => {
            nodeMap.set(node.id, node);
        });
    }

    return nodeMap;
}

interface NodeDifference {
    type: DiffType;
    current?: IPublicTypeNodeSchema;
    next?: IPublicTypeNodeSchema;
    diff?: DiffEvent[];
}

function calcNodeModify({
    sourceNodeMap,
    targetNodeMap,

    sourceNodeSchema,
    targetNodeSchema,
}: {
    differenceMap: Map<string, NodeDifference>;
    sourceNodeMap: Map<string, IPublicTypeNodeSchema>;
    targetNodeMap: Map<string, IPublicTypeNodeSchema>;
    sourceNodeSchema: IPublicTypeNodeSchema;
    targetNodeSchema: IPublicTypeNodeSchema;
}) {
    const { props: sourceProps, children: sourceChildren, ...sourceOtherData } = sourceNodeSchema;
    const { props: targetProps, children: targetChildren, ...targetOtherData } = targetNodeSchema;

    const otherDataDiff = diff(sourceOtherData, targetOtherData, {
        comparators: {
            'condition': isEqual,
            'loop': isEqual,
            'loopArgs': isEqual,
            'events.*': isEqual,
            'directives.*': isEqual,
        },
    });

    // children、props、props.children 处理, children 里面包含不同类型的 node
}

function calcPageSchemaModify({
    sourceNodeMap,
    targetNodeMap,

    sourcePageSchema,
    targetPageSchema,
}: {
    sourceNodeMap: Map<string, IPublicTypeNodeSchema>;
    targetNodeMap: Map<string, IPublicTypeNodeSchema>;
    sourcePageSchema: IPublicTypePageSchema;
    targetPageSchema: IPublicTypePageSchema;
}) {
    const differenceMap = new Map<string, NodeDifference>();

    const { code: sourceCode, ...otherSourceData } = sourcePageSchema;
    const { code: targetCode, ...otherTargetData } = targetPageSchema;

    calcNodeModify({
        differenceMap,
        sourceNodeMap,
        targetNodeMap,
        sourceNodeSchema: otherSourceData,
        targetNodeSchema: otherTargetData,
    });

    // TODO 计算 code 的差异

    for (const [id, sourceNode] of baseNodeMap) {
        const targetNode = targetNodeMap.get(id);
        if (targetNode) {
            // children、props、props.children 处理, children 里面包含不同类型的 node
            const diffResult = diff(sourceNode, targetNode, {
                comparators: {
                    'condition': isEqual,
                    'loop': isEqual,
                    'loopArgs': isEqual,
                    'props.*': isEqual,
                    'events.*': isEqual,
                    'directives.*': isEqual,
                },
            });
            // TODO change
        }
        else {
            differenceMap.set(id, {
                type: DiffType.Change,
                current: sourceNode,
            });
        }
    }

    for (const [id, targetNode] of targetNodeMap) {
        if (!baseNodeMap.has(id)) {
            differenceMap.set(id, {
                type: DiffType.Add,
                next: targetNode,
            });
        }
    }

    return differenceMap;
}

function getNodeRef(nodeDiff: NodeDifference, diffMap: Map<string, NodeDifference>) {
    for (const [_, value] of diffMap) {
        if (value.ref === nodeDiff.ref && value.type === DiffType.Add)
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
    currentDiffMap: Map<string, NodeDifference>;
    nextDiffMap: Map<string, NodeDifference>;
    currentNodeMap: Map<string, IPublicTypeNodeSchema>;
}) {
    const conflictMap = new Map<string, CodeConflict>();

    for (const [key, value] of nextDiffMap) {
        const currentDiff = currentDiffMap.get(key);
        if (currentDiff && currentDiff.type === DiffType.Change && currentDiff.nextRef && value.nextRef && value.nextRef !== currentDiff.ref) {
            conflictMap.set(key, {
                key,
                id: currentDiff.id,
                type: DiffType.Change,
                currentNode: currentNodeMap.get(key),
            });
        }
        else if (value.type === DiffType.Add) {
            const currentDiff = getNodeRef(value, currentDiffMap);
            if (currentDiff) {
                conflictMap.set(key, {
                    key,
                    id: currentDiff.id,
                    diffType: DiffType.Change,
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

    if (nodeModifyConflict.size) {
        return {
            isConflict: true,
            nodeModifyConflict,
        };
    }

    const mergedPageSchema = handlePageSchemaMerged({
        baseNodeMap,
        currentNodeMap,
        nextNodeMap,

        baseSchema,
        currentSchema,
        nextSchema,
    });

    return {
        isConflict: false,
        nodeModifyConflict,
        mergedPageSchema,
    };
}
