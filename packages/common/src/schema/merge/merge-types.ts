import type { ICodeItem, IPublicTypeNodeSchema } from '@webank/letgo-types';

export enum DiffType {
    Added = 'added',
    Updated = 'updated',
    Delete = 'deleted',
}

export interface CodeConflict {
    key: string;
    id: string;
    diffType: DiffType;
    currentCode?: ICodeItem;
    currentNode?: IPublicTypeNodeSchema;
}
