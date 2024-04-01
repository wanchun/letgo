import type { ICodeItem, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { DiffType } from '../diff/diff-types';

export interface CodeConflict {
    uid: string;
    type: DiffType;
    currentCode?: ICodeItem;
    currentNode?: IPublicTypeNodeSchema;
}
