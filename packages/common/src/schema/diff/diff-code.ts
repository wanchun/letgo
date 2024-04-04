import { isEqual } from 'lodash-es';
import type { ICodeItemWithDirectory } from '../code';
import { diff } from './diff';
import type { DiffEvent } from './diff';

export interface CodeDifference {
    type: 'add' | 'remove' | 'change';
    current?: ICodeItemWithDirectory;
    next?: ICodeItemWithDirectory;
    diff?: DiffEvent[];
};

export function diffCode(baseCodeMap: Map<string, ICodeItemWithDirectory>, targetCodeMap: Map<string, ICodeItemWithDirectory>) {
    const differenceMap = new Map<string, CodeDifference>();

    for (const [key, codeItem] of baseCodeMap) {
        const targetCodeItem = targetCodeMap.get(key);
        if (targetCodeItem) {
            // 没有差异
            const diffResult = diff(codeItem, targetCodeItem, {
                comparators: {
                    'successEvent.*': isEqual,
                    'failureEvent.*': isEqual,
                },
            });
            if (diffResult.length) {
                differenceMap.set(key, {
                    type: 'change',
                    current: codeItem,
                    next: targetCodeItem,
                    diff: diffResult,
                });
            }
        }
        else {
            // 没找到, 被删除了
            differenceMap.set(key, {
                type: 'remove',
                current: codeItem,
            });
        }
    }
    for (const [key, targetCodeItem] of targetCodeMap) {
        const codeItem = baseCodeMap.get(key);
        if (!codeItem) {
            // 没找到
            differenceMap.set(key, {
                type: 'add',
                next: targetCodeItem,
            });
        }
    }

    return differenceMap;
}
