import deepDiff from 'deep-diff';
import type { ICodeItemWithDirectory } from '../code';
import { DiffType } from './diff-types';

export interface CodeDifference {
    type: DiffType;
    current?: ICodeItemWithDirectory;
    next?: ICodeItemWithDirectory;
    diff?: deepDiff.Diff<ICodeItemWithDirectory, ICodeItemWithDirectory>[];
}

export function diffCode(baseCodeMap: Map<string, ICodeItemWithDirectory>, targetCodeMap: Map<string, ICodeItemWithDirectory>) {
    const differenceMap = new Map<string, CodeDifference>();

    for (const [key, codeItem] of baseCodeMap) {
        const targetCodeItem = targetCodeMap.get(key);
        if (targetCodeItem) {
            // 没有差异
            const diffResult = deepDiff.diff(codeItem, targetCodeItem);
            if (diffResult) {
                differenceMap.set(key, {
                    type: DiffType.Updated,
                    current: codeItem,
                    next: targetCodeItem,
                    diff: diffResult,
                });
            }
        }
        else {
            // 没找到, 被删除了
            differenceMap.set(key, {
                type: DiffType.Delete,
                current: codeItem,
            });
        }
    }
    for (const [key, targetCodeItem] of targetCodeMap) {
        const codeItem = baseCodeMap.get(key);
        if (!codeItem) {
            // 没找到
            differenceMap.set(key, {
                type: DiffType.Added,
                next: targetCodeItem,
            });
        }
    }

    return differenceMap;
}
