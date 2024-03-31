import type { ICodeDirectory, ICodeItem, ICodeItemOrDirectory, ICodeStruct, IEnumCodeType, IPublicTypeNodeSchema } from '@webank/letgo-types';
import { cloneDeep, isEqual, merge, omit } from 'lodash-es';
import { DiffType } from './merge-types';
import type { CodeConflict } from './merge-types';

interface CodeDiff {
    key: string;
    id: string;
    diffType: DiffType;
    nextId?: string;
    item: ICodeItem;
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
                diffType: DiffType.Delete,
                item: targetCodeItem,
            });
        }
        else if (!isEqual(value, targetCodeItem)) {
            diffResult.set(key, {
                key,
                id: value.id,
                nextId: targetCodeItem.id !== value.id ? targetCodeItem.id : undefined,
                diffType: DiffType.Updated,
                item: targetCodeItem,
            });
        }
    }

    for (const [key, value] of targetCodeMap) {
        if (!baseCodeMap.has(key)) {
            diffResult.set(key, {
                key,
                id: value.id,
                diffType: DiffType.Added,
                item: targetCodeMap.get(key),
            });
        }
    }

    return diffResult;
}

interface DirectoryDiff {
    key: string;
    diffType: DiffType;
    id?: string;
    nextId?: string;
}

function calcDirectoryModify(baseCode: ICodeStruct, targetCode: ICodeStruct) {
    const diffResult = new Map<string, DirectoryDiff>();

    for (const directory of baseCode.directories) {
        const targetDirectory = targetCode.directories.find(item => item.key === directory.key);
        if (!targetDirectory) {
            diffResult.set(directory.key, {
                key: directory.key,
                diffType: DiffType.Delete,
            });
        }
        else if (targetDirectory.id !== directory.id) {
            diffResult.set(directory.key, {
                key: directory.key,
                diffType: DiffType.Updated,
                id: directory.id,
                nextId: targetDirectory.id,
            });
        }
    }
    for (const directory of targetCode.directories) {
        if (!baseCode.directories.find(item => item.key === directory.key)) {
            diffResult.set(directory.key, {
                key: directory.key,
                diffType: DiffType.Added,
            });
        }
    }

    return diffResult;
}

function getCodeId(codeDiff: CodeDiff, diffMap: Map<string, CodeDiff>) {
    for (const [_, value] of diffMap) {
        if (value.id === codeDiff.id && value.item.type === codeDiff.item.type && value.diffType === DiffType.Added)
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
        directories: [],
        code: [],
    };
    const mergedCodeMap = new Map<string, ICodeItem>();

    const currentDirectoryDiffMap = calcDirectoryModify(baseCode, currentCode);
    const nextDirectoryDiffMap = calcDirectoryModify(baseCode, nextCode);

    function addCodeItem(codes: ICodeItem[], codeItem: ICodeItem) {
        if (!mergedCodeMap.has(codeItem.key)) {
            mergedCodeMap.set(codeItem.key, codeItem);
            codes.push(codeItem);
        }
    }

    for (const directory of currentCode.directories) {
        const nextDirectory = nextCode.directories.find(item => item.key === directory.key);
        const nextDirectoryDiff = nextDirectoryDiffMap.get(directory.key);
        const codes: ICodeItem[] = [];
        const newDirectory: ICodeDirectory = {
            key: directory.key,
            id: directory.id,
            code: codes,
        };
        if (nextDirectory) {
            if (nextDirectoryDiff && nextDirectoryDiff.diffType === DiffType.Updated)
                newDirectory.id = nextDirectoryDiff.nextId;

            for (const codeItem of directory.code) {
                const nextDiff = nextDiffMap.get(codeItem.key);
                if (!nextDiff) {
                    addCodeItem(codes, codeItem);
                    continue;
                };

                const currentDiff = currentDiffMap.get(codeItem.key);

                if (nextDiff.diffType === DiffType.Updated) {
                    // TODO 修改 Id 的场景
                    addCodeItem(codes, merge(codeItem, nextDiff.item));
                }
                else if (nextDiff.diffType === DiffType.Delete) {
                    if (currentDiff && currentDiff.diffType === DiffType.Updated)
                        addCodeItem(codes, codeItem);
                }
            }

            // 新移入分类的
            for (const codeItem of nextDirectory.code) {
                if (!directory.code.find(item => item.key !== codeItem.key)) {
                    const nextDiff = nextDiffMap.get(codeItem.key);
                    if (!nextDiff) {
                        addCodeItem(codes, codeItem);
                        continue;
                    };

                    const currentDiff = currentDiffMap.get(codeItem.key);

                    if (nextDiff.diffType === DiffType.Added) {
                        let hasAdded = false;
                        for (const cDiff of currentDiffMap.values()) {
                            // 新增了相同的 id 并且类型一样，进行合并
                            if (cDiff.id === codeItem.id) {
                                hasAdded = true;
                                addCodeItem(codes, merge(cDiff.item, codeItem));
                            }
                        }
                        if (!hasAdded)
                            addCodeItem(codes, codeItem);
                    }
                    if (nextDiff.diffType === DiffType.Updated) {
                        if (currentDiff && currentDiff.diffType === DiffType.Delete)
                            addCodeItem(codes, codeItem);
                        else
                            addCodeItem(codes, merge(currentDiff.item, codeItem));
                    }
                }
            }

            mergedCode.directories.push(newDirectory);
        }
        else {
            // nextCode 删除的分类，或者是 currentCode 新增分类

            // currentCode 新增分类
            const currentDirectoryDiff = currentDirectoryDiffMap.get(directory.key);
            if (currentDirectoryDiff) {
                for (const codeItem of directory.code) {
                    const nextDiff = nextDiffMap.get(codeItem.key);
                    if (!nextDiff) {
                        addCodeItem(codes, codeItem);
                        continue;
                    };

                    const currentDiff = currentDiffMap.get(codeItem.key);

                    if (nextDiff.diffType === DiffType.Updated) {
                        // TODO 修改 Id 的场景
                        addCodeItem(codes, merge(codeItem, nextDiff.item));
                    }
                    else if (nextDiff.diffType === DiffType.Delete) {
                        if (currentDiff && currentDiff.diffType === DiffType.Updated)
                            addCodeItem(codes, codeItem);
                    }
                }
                mergedCode.directories.push(newDirectory);
            }
        }
    }
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
