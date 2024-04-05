import type { ICodeStruct, IEventHandler } from '@webank/letgo-types';
import { cloneDeep, isEqual, omit } from 'lodash-es';
import type { CodeDifference } from '../diff/diff-code';
import { diffCode } from '../diff/diff-code';
import { compositeCodeStruct, flatCodeStruct } from '../code';
import type { ICodeItemWithDirectory } from '../code';

import { type DiffEvent, DiffType, type Path, applyChange } from '../diff/diff';
import type { ConfirmAction, MergeCodeConflict, SubConflict, UserConfirm } from './merge-types';

function transformDiffToIdKey(codeDiff: Map<string, CodeDifference>, codeMap: Map<string, ICodeItemWithDirectory>) {
    const idDiffMap = new Map<string, ICodeItemWithDirectory>();
    for (const [cKey] of codeDiff) {
        const codeItem = codeMap.get(cKey);
        if (codeItem)
            idDiffMap.set(codeItem.id, codeItem);
    }
    return idDiffMap;
}

function getValPath(diffEvent: DiffEvent) {
    if (['add-item', 'move-item'].includes(diffEvent.type))
        return `${diffEvent.newPath.join('.')}.${diffEvent.newIndex}`;

    if (diffEvent.type === 'remove-item')
        return `${diffEvent.newPath.join('.')}.${diffEvent.curIndex}`;

    return diffEvent.newPath.join('.');
}

function prefixPathEqual(source: Path, target: Path) {
    for (const [index, val] of source.entries()) {
        if (target[index] !== val)
            return false;
    }
    return true;
}

function getSubConflict(nextDiffEvent: DiffEvent, currentDiffEvent: DiffEvent, confirmSub: Record<string, ConfirmAction>): SubConflict {
    const nextValPath = getValPath(nextDiffEvent);
    if (!confirmSub[nextValPath]) {
        return {
            path: nextValPath,
            newPath: getValPath(currentDiffEvent),
            type: nextDiffEvent.type,
            newType: currentDiffEvent.type,
            value: nextDiffEvent.newValue,
            newValue: currentDiffEvent.newValue,
        };
    }
    return null;
}

function isEqualEventHandler(source: IEventHandler, target: IEventHandler) {
    return source.name === target.name && source.namespace === target.namespace && source.method === target.method;
}

function getCodeModifyConflict({
    currentCodeDiff,
    nextCodeDiff,
    currentCodeMap,

    userConfirmMap,
}: {
    currentCodeDiff: Map<string, CodeDifference>;
    nextCodeDiff: Map<string, CodeDifference>;
    currentCodeMap: Map<string, ICodeItemWithDirectory>;
    nextCodeMap: Map<string, ICodeItemWithDirectory>;
    userConfirmMap: Map<string, UserConfirm>;
}) {
    const conflicts = new Map<string, MergeCodeConflict>(); ;

    const currentDiffIds = transformDiffToIdKey(currentCodeDiff, currentCodeMap);

    for (const [key, nextDiff] of nextCodeDiff) {
        const userConfirm = userConfirmMap.get(key);
        if (nextDiff.type === DiffType.Add && !userConfirm) {
            const currentCodeItem = currentDiffIds.get(nextDiff.next.id);
            if (currentCodeItem) {
                const currentDiff = currentCodeDiff.get(currentCodeItem.key);
                if (currentDiff.type === DiffType.Add && !isEqual(omit(nextDiff.next, 'key'), omit(currentCodeItem, 'key'))) {
                    conflicts.set(key, {
                        key,
                        type: DiffType.Add,
                        newType: DiffType.Add,
                        value: nextDiff.next,
                        newValue: currentCodeItem,
                    });
                }
                else if (currentDiff.type === DiffType.Change) {
                    conflicts.set(key, {
                        key,
                        type: DiffType.Add,
                        newType: DiffType.Change,
                        value: nextDiff.next,
                        newValue: currentCodeItem,
                    });
                }
            }
        }
        else if (nextDiff.type === DiffType.Remove && !userConfirm) {
            const currentDiff = currentCodeDiff.get(key);
            if (currentDiff && currentDiff.type === DiffType.Change) {
                conflicts.set(key, {
                    key,
                    type: DiffType.Remove,
                    newType: DiffType.Change,
                    value: nextDiff.current,
                    newValue: currentDiff.next,
                });
            }
        }
        else if (nextDiff.type === DiffType.Change) {
            const currentDiff = currentCodeDiff.get(key);
            if (currentDiff) {
                if (currentDiff.type === DiffType.Remove && !userConfirm) {
                    conflicts.set(key, {
                        key,
                        type: DiffType.Change,
                        newType: DiffType.Remove,
                        value: nextDiff.next,
                        newValue: currentDiff.current,
                    });
                }
                else if (currentDiff.type === DiffType.Change) {
                    // DiffEvent 处理
                    let subConflict: SubConflict[] = [];
                    const confirmSub: Record<string, ConfirmAction> = userConfirm?.sub || {};
                    for (const nextDiffEvent of nextDiff.diff) {
                        if (nextDiffEvent.oldPath.at(-1) === 'directory')
                            continue;

                        for (const currentDiffEvent of currentDiff.diff) {
                            const equalPath = isEqual(nextDiffEvent.oldPath, currentDiffEvent.oldPath);
                            if (nextDiffEvent.type === 'add' && equalPath) {
                                if (currentDiffEvent.type === 'add' && !isEqual(nextDiffEvent.newValue, currentDiffEvent.newValue))
                                    subConflict.push(getSubConflict(nextDiffEvent, currentDiffEvent, confirmSub));
                            }
                            else if (['remove', 'remove-item'].includes(nextDiffEvent.type)) {
                                if (currentDiffEvent.type === 'change' && prefixPathEqual(nextDiffEvent.oldPath, currentDiffEvent.oldPath))
                                    subConflict.push(getSubConflict(nextDiffEvent, currentDiffEvent, confirmSub));
                            }
                            else if (nextDiffEvent.type === 'change') {
                                if (['remove', 'remove-item'].includes(currentDiffEvent.type) && prefixPathEqual(currentDiffEvent.oldPath, nextDiffEvent.oldPath)) {
                                    subConflict.push(getSubConflict(nextDiffEvent, currentDiffEvent, confirmSub));
                                }
                                else if (currentDiffEvent.type === 'change' && equalPath) {
                                    if (!isEqual(nextDiffEvent.newValue, currentDiffEvent.newValue))
                                        subConflict.push(getSubConflict(nextDiffEvent, currentDiffEvent, confirmSub));
                                }
                            }
                            else if (nextDiffEvent.type === 'add-item') {
                                if (currentDiffEvent.type === 'add-item' && isEqualEventHandler(nextDiffEvent.newValue, currentDiffEvent.newValue))
                                    subConflict.push(getSubConflict(nextDiffEvent, currentDiffEvent, confirmSub));
                            }
                        }
                    }

                    subConflict = subConflict.filter(Boolean);
                    if (subConflict.length) {
                        conflicts.set(key, {
                            key,
                            type: DiffType.Change,
                            newType: DiffType.Change,
                            value: nextDiff.next,
                            newValue: currentDiff.next,
                            sub: subConflict,
                        });
                    }
                }
            }
        }
    }

    return conflicts;
}

function getChangeCodeId(source: DiffEvent[], target: DiffEvent[]) {
    const sourceEvent = source.find(item => isEqual(item.newPath, ['id']));
    const targetEvent = target.find(item => isEqual(item.newPath, ['id']));

    if (sourceEvent && !targetEvent)
        return sourceEvent.newValue;

    if (!sourceEvent && targetEvent)
        return targetEvent.newValue;

    return null;
}

function handleCodeMerged({
    baseCodeMap,
    currentDiffMap,
    nextCodeMap,

    nextDiffMap,
    currentCodeMap,
}: {
    baseCodeMap: Map<string, ICodeItemWithDirectory>;
    currentCodeMap: Map<string, ICodeItemWithDirectory>;
    nextCodeMap: Map<string, ICodeItemWithDirectory>;

    currentDiffMap: Map<string, CodeDifference>;
    nextDiffMap: Map<string, CodeDifference>;
}) {
    const resultCodeMap = cloneDeep(currentCodeMap);
    // TODO 如果修改了 id，则需要把所有引用改成新的 id
    const changedIds: string[] = [];

    for (const [key, nextDiff] of nextDiffMap) {
        if (nextDiff.type === DiffType.Add) {
            resultCodeMap.set(key, nextDiff.next);
        }
        else if (nextDiff.type === DiffType.Remove) {
            resultCodeMap.delete(key);
        }
        else if (nextDiff.type === DiffType.Change) {
            const currentDiff = currentDiffMap.get(key);
            if (!currentDiff || currentDiff.type === DiffType.Remove) {
                resultCodeMap.set(key, nextDiff.next);
            }
            else {
                const cId = getChangeCodeId(nextDiff.diff, currentDiff.diff);
                if (cId)
                    changedIds.push(cId);

                const codeItem = resultCodeMap.get(key);
                for (const diffEvent of nextDiff.diff)
                    applyChange(codeItem, baseCodeMap.get(key), nextCodeMap.get(key), diffEvent, 'id');
            }
        }
    }

    return { resultCodeMap, changedIds };
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
    const { resultCodeMap, changedIds } = handleCodeMerged({
        baseCodeMap,
        currentCodeMap,
        nextCodeMap,

        currentDiffMap: currentCodeDiff,
        nextDiffMap: nextCodeDiff,
    });
    const mergedCode = compositeCodeStruct(resultCodeMap, currentCode, nextCode);

    return {
        mergedCode,
        changedIds,
    };
}
