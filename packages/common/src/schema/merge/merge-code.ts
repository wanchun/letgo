import type { ICodeStruct } from '@webank/letgo-types';
import { cloneDeep, merge } from 'lodash-es';
import type { CodeDifference } from '../diff/diff-code';
import { diffCode } from '../diff/diff-code';
import { DiffType } from '../diff/diff-types';
import { compositeCodeStruct, flatCodeStruct } from '../code';
import type { ICodeItemWithDirectory } from '../code';

import type { CodeConflict, UserConfirm } from './merge-types';

function transformDiffToIdKey(codeDiff: Map<string, CodeDifference>, codeMap: Map<string, ICodeItemWithDirectory>) {
    const idDiffMap = new Map<string, ICodeItemWithDirectory>();
    for (const [cKey] of codeDiff) {
        const codeItem = codeMap.get(cKey);
        if (codeItem)
            idDiffMap.set(codeItem.id, codeItem);
    }
    return idDiffMap;
}

/**
 * 判定冲突条件
 * 1. 同时新增了相同的 id
 * 2. currentCode 修改一个已有的 codeItem id, 和新增的 id 一致
 *
 * TODO 扩展冲突条件
 * 3. 一个修改了，一个删除了
 */
function getCodeModifyConflict({
    currentCodeDiff,
    nextCodeDiff,
    currentCodeMap,
    nextCodeMap,

    userConfirmMap,
}: {
    currentCodeDiff: Map<string, CodeDifference>;
    nextCodeDiff: Map<string, CodeDifference>;
    currentCodeMap: Map<string, ICodeItemWithDirectory>;
    nextCodeMap: Map<string, ICodeItemWithDirectory>;
    userConfirmMap: Map<string, UserConfirm>;
}) {
    const conflictMap = new Map<string, CodeConflict>();

    const currentDiffIds = transformDiffToIdKey(currentCodeDiff, currentCodeMap);

    for (const [key, nextDiff] of nextCodeDiff) {
        const nextCodeItem = nextCodeMap.get(key);
        // 只有 codeItem 才判冲突
        if (nextDiff.type === DiffType.Added) {
            const currentCodeItem = currentDiffIds.get(nextCodeItem.id);
            if (currentCodeItem) {
                const currentDiff = currentCodeDiff.get(currentCodeItem.key);
                if (currentDiff.type === DiffType.Added) {
                    conflictMap.set(key, {
                        uid: key,
                        type: DiffType.Added,
                        currentCode: currentCodeItem,
                    });
                }
                else if (currentDiff.type === DiffType.Updated) {
                    conflictMap.set(key, {
                        uid: key,
                        type: DiffType.Updated,
                        currentCode: currentCodeItem,
                    });
                }
            }
        }
    }

    return conflictMap;
}

function handleCodeMerged({
    currentDiffMap,
    nextDiffMap,
    currentCodeMap,
}: {
    currentCodeMap: Map<string, ICodeItemWithDirectory>;
    currentDiffMap: Map<string, CodeDifference>;
    nextDiffMap: Map<string, CodeDifference>;
}) {
    const resultCodeMap = cloneDeep(currentCodeMap);

    for (const [key, nextDiff] of nextDiffMap) {
        if (nextDiff.type === DiffType.Added) {
            resultCodeMap.set(key, nextDiff.next);
        }
        else if (nextDiff.type === DiffType.Updated) {
            // 更新
            const currentDiff = currentDiffMap.get(key);
            if (!currentDiff || currentDiff.type === DiffType.Delete) {
                resultCodeMap.set(key, nextDiff.next);
            }
            else {
                // TODO diff 合并
                resultCodeMap.set(key, merge(currentDiff.next, nextDiff.next));
                // TODO 如果修改了 id，则需要把所有引用改成新的 id
            }
        }
        else if (nextDiff.type === DiffType.Delete) {
            resultCodeMap.delete(key);
        }
    }

    return resultCodeMap;
}

export function mergeCode(baseCode: ICodeStruct, currentCode: ICodeStruct, nextCode: ICodeStruct, userConfirms: UserConfirm[] = []) {
    const baseCodeMap = flatCodeStruct(baseCode);
    const currentCodeMap = flatCodeStruct(currentCode);
    const nextCodeMap = flatCodeStruct(nextCode);

    const userConfirmMap = new Map(userConfirms.map(item => [item.uid, item]));

    const currentCodeDiff = diffCode(baseCodeMap, currentCodeMap);
    const nextCodeDiff = diffCode(baseCodeMap, nextCodeMap);

    const codeModifyConflict = getCodeModifyConflict({
        currentCodeDiff,
        nextCodeDiff,
        currentCodeMap,
        nextCodeMap,
        userConfirmMap,
    });
    if (codeModifyConflict.size) {
        return {
            isConflict: true,
            codeModifyConflict,
        };
    }
    // 没有冲突，进行 merge
    const resultCodeMap = handleCodeMerged({
        currentCodeMap,

        currentDiffMap: currentCodeDiff,
        nextDiffMap: nextCodeDiff,
    });
    const mergedCode = compositeCodeStruct(resultCodeMap, currentCode, nextCode);

    return {
        isConflict: false,
        mergedCode,
    };
}
