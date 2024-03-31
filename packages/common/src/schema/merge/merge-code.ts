import type { ICodeItem, ICodeStruct, IEnumCodeType, IPublicTypeNodeSchema } from '@webank/letgo-types';
import { isEqual } from 'lodash-es';
import { DiffType } from './merge-types';
import type { CodeConflict } from './merge-types';

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

function handleCodeMerged({
    baseCode,
    currentCode,
    nextCode,

    currentDiffMap,
    nextDiffMap,
}: {
    baseCode: ICodeStruct;
    currentCode: ICodeStruct;
    nextCode: ICodeStruct;

    currentDiffMap: Map<string, CodeDiff>;
    nextDiffMap: Map<string, CodeDiff>;
}) {
    const mergedCode: ICodeStruct = {
        code: [],
        directories: [],
    };
}

export function mergeCode(baseCode: ICodeStruct, currentCode: ICodeStruct, nextCode: ICodeStruct) {
    const baseCodeMap = genCodeMap(baseCode);
    const currentCodeMap = genCodeMap(currentCode);
    const nextCodeMap = genCodeMap(nextCode);

    const currentCodeDiff = calcCodeModify(baseCodeMap, currentCodeMap);
    const nextCodeDiff = calcCodeModify(baseCodeMap, nextCodeMap);
    const codeModifyConflict = getCodeModifyConflict({
        currentDiffMap: currentCodeDiff,
        nextDiffMap: nextCodeDiff,
        currentCodeMap,
    });

    let isConflict: boolean = false;
    let mergedCode: ICodeStruct;
    // 没有冲突，进行 merge
    if (codeModifyConflict.size === 0) {
        mergedCode = handleCodeMerged({
            baseCode,
            currentCode,
            nextCode,

            currentDiffMap: currentCodeDiff,
            nextDiffMap: nextCodeDiff,
        });
    }
    else {
        isConflict = true;
    }

    return {
        isConflict,
        codeModifyConflict,
        mergedCode,
    };
}
