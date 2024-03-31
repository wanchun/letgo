import type { ICodeItem, ICodeStruct, IEnumCodeType, IPublicTypeNodeSchema, IPublicTypePageSchema } from '@webank/letgo-types';
import { isEqual } from 'lodash-es';
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
    type: IEnumCodeType;
    currentId: string;
    currentType: IEnumCodeType;
    diffType: DiffType;
}

function getCodeModifyConflict(currentDiffMap: Map<string, CodeDiff>, nextDiffMap: Map<string, CodeDiff>) {
    const conflictMap = new Map<string, CodeConflict>();

    for (const [key, value] of nextDiffMap) {
        const currentDiff = currentDiffMap.get(key);
        if (currentDiff && currentDiff.diffType === DiffType.Updated && currentDiff.nextId && value.nextId && value.nextId !== currentDiff.nextId) {
            conflictMap.set(key, {
                key,
                id: currentDiff.id,
                currentId: currentDiff.nextId,
                type: value.type,
                diffType: DiffType.Updated,
            });
        }
        else if (value.diffType === DiffType.Added) {

        }
    }
}

function genNodeMap(schema: IPublicTypePageSchema) {
    const nodeMap = new Map<string, IPublicTypeNodeSchema>();
    traverseNodeSchema(schema.children, (node: IPublicTypeNodeSchema) => {
        nodeMap.set(node.id, node);
    });

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
        else if (!isEqual(value, targetCodeItem)) {
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
}

export function mergePageSchema(baseSchema: IPublicTypePageSchema, currentSchema: IPublicTypePageSchema, nextSchema: IPublicTypePageSchema) {
    const baseCodeMap = genCodeMap(baseSchema.code);
    const currentCodeMap = genCodeMap(currentSchema.code);
    const nextCodeMap = genCodeMap(nextSchema.code);

    const currentCodeDiff = calcCodeModify(baseCodeMap, currentCodeMap);
    const nextCodeDiff = calcCodeModify(baseCodeMap, nextCodeMap);

    const baseNodeMap = genNodeMap(baseSchema);
    const currentNodeMap = genNodeMap(currentSchema);
    const nextNodeMap = genNodeMap(nextSchema);

    const currentNodeDiff = calcNodeModify(baseNodeMap, currentNodeMap);
    const nextNodeDiff = calcNodeModify(baseNodeMap, nextNodeMap);
}
