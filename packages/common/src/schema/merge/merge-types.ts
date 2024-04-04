import type { DiffType } from '../diff/diff';

export interface SubConflict {
    path: string;
    newPath: string;
    type: DiffType;
    newType: DiffType;
    value: any;
    newValue: any;
}

interface MergeConflictBase {
    type: DiffType;
    newType: DiffType;
    value: any;
    newValue: any;
    sub?: SubConflict[];
}

export interface MergeCodeConflict extends MergeConflictBase {
    key: string;
}

export enum ConfirmAction {
    Delete = 'deleted',
    Cover = 'cover',
}

export interface UserConfirm {
    uid: string;
    action?: ConfirmAction;
    sub?: {
        [path: string]: ConfirmAction;
    };
}
