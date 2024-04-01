import type { ICodeItem, IPublicTypeNodeSchema } from '@webank/letgo-types';
import type { DiffType } from '../diff/diff-types';

export interface CodeConflict {
    uid: string;
    type: DiffType;
    currentCode?: ICodeItem;
    currentNode?: IPublicTypeNodeSchema;
}

export enum ConfirmAction {
    Reserve = 'reserved',
    Delete = 'deleted',
}

export interface UserConfirm {
    uid: string;
    action: ConfirmAction;
}
