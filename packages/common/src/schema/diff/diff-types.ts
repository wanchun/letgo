export enum DiffType {
    Added = 'added',
    Updated = 'updated',
    Delete = 'deleted',
    Moved = 'moved',
}

export type Position = (string | number)[];

export interface Move {
    to: Position;
    isUpdated: boolean;
}

export interface Difference {
    type: DiffType;
    path: (string | number)[];
    move?: Move;
    index?: number;
}

export interface CodeDifference extends Difference {
    key: string;
}
