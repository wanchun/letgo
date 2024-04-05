import { get, isObject, set, unset } from 'lodash-es';

export enum DiffType {
    Add = 'add',
    Remove = 'remove',
    Change = 'change',
    AddItem = 'add-item',
    RemoveItem = 'remove-item',
    MoveItem = 'move-item',
}

export interface PathChange {
    oldPath: Path;
    newPath: Path;
}

export interface DiffOptions extends Partial<PathChange> {
    idProp?: string;
    idProps?: { [path: string]: string };
    callback?: (event: DiffEvent) => void;
    comparators?: {
        [path: string]: (oldValue: any, newValue: any, options: PathChange) => boolean;
    };
    ignore?: Comparator;
}

export type Comparator = (oldValue: any, newValue: any, options: PathChange) => boolean;

export interface DiffEvent extends PathChange {
    type: DiffType;
    oldValue?: any;
    newValue?: any;
    oldIndex?: number;
    curIndex?: number;
    newIndex?: number;
}

export type Path = Array<string | number>;

export function diff(oldObj: any, newObj: any, ops?: DiffOptions): DiffEvent[] {
    ops = ops || {};

    const changes: DiffEvent[] = [];
    const oldPath = ops.oldPath || [];
    const newPath = ops.newPath || [];
    const ID_PROP = ops.idProp || 'id';
    const ADD_EVENT = DiffType.Add;
    const REMOVE_EVENT = DiffType.Remove;
    const CHANGE_EVENT = DiffType.Change;
    const ADD_ITEM_EVENT = DiffType.AddItem;
    const REMOVE_ITEM_EVENT = DiffType.RemoveItem;
    const MOVE_ITEM_EVENT = DiffType.MoveItem;
    const callback = ops.callback || function (item) {
        changes.push(item);
    };
    const comparators = ops.comparators || {};
    const ignore = ops.ignore;
    let i; let len; let prop; let id;

    if ((!isObject(oldObj) || !isObject(newObj)) && oldObj !== newObj) {
        callback({
            oldPath,
            newPath,
            type: CHANGE_EVENT,
            oldValue: oldObj,
            newValue: newObj,
        });

        return changes;
    }

    if (ignore && ignore(oldObj, newObj, { oldPath, newPath }))
        return changes;

    if (Array.isArray(oldObj)) {
        const idProp
                    = (ops.idProps
                    && (
                        ops.idProps[oldPath.map(numberToAsterisk).join('.')]
                        || ops.idProps[oldPath.join('.')]
                    )) || ID_PROP;

        if (idProp === '*') {
            const oldLength = oldObj.length;
            const newLength = newObj.length;

            for (i = 0, len = oldLength > newLength ? oldLength : newLength; i < len; i++) {
                if (i < oldLength && i < newLength) {
                    diff(oldObj[i], newObj[i], Object.assign({}, ops, {
                        callback,
                        oldPath: oldPath.concat(i),
                        newPath: newPath.concat(i),
                    }));
                }
                else if (i >= oldLength) {
                    callback({
                        oldPath,
                        newPath,
                        type: ADD_ITEM_EVENT,
                        oldIndex: -1,
                        curIndex: -1,
                        newIndex: i,
                        oldValue: undefined,
                        newValue: newObj[i],
                    });
                }
                else if (i >= newLength) {
                    callback({
                        oldPath,
                        newPath,
                        type: REMOVE_ITEM_EVENT,
                        oldIndex: i,
                        curIndex: newLength,
                        newIndex: -1,
                        oldValue: oldObj[i],
                        newValue: undefined,
                    });
                }
            }

            return changes;
        }

        const sample = oldObj.length > 0 ? oldObj[0] : newObj[0];

        if (sample === undefined)
            return changes;

        const objective = typeof sample === 'object';

        const oldHash = objective ? indexBy(oldObj, idProp) : hashOf(oldObj);
        const newHash = objective ? indexBy(newObj, idProp) : hashOf(newObj);
        const curArray = [].concat(oldObj);
        let curIndex; let oldIndex;

        for (i = 0, len = oldObj.length; i < len; i++) {
            id = objective ? oldObj[i][idProp] : oldObj[i];

            if (!Object.prototype.hasOwnProperty.call(newHash, id)) {
                curIndex = curArray.indexOf(oldObj[i]);
                curArray.splice(curIndex, 1);

                callback({
                    oldPath,
                    newPath,
                    type: REMOVE_ITEM_EVENT,
                    oldIndex: i,
                    curIndex,
                    newIndex: -1,
                    oldValue: oldObj[i],
                    newValue: undefined,
                });
            }
        }

        for (i = 0, len = newObj.length; i < len; i++) {
            id = objective ? newObj[i][idProp] : newObj[i];

            if (!Object.prototype.hasOwnProperty.call(oldHash, id)) {
                callback({
                    oldPath,
                    newPath,
                    type: ADD_ITEM_EVENT,
                    oldIndex: -1,
                    curIndex: -1,
                    newIndex: i,
                    newValue: newObj[i],
                });

                if (i >= curArray.length)
                    curArray.push(newObj[i]);

                else
                    curArray.splice(i, 0, newObj[i]);
            }
        }

        for (i = 0, len = newObj.length; i < len; i++) {
            id = objective ? newObj[i][idProp] : newObj[i];

            if (!Object.prototype.hasOwnProperty.call(oldHash, id))
                continue;

            oldIndex = oldObj.indexOf(oldHash[id]);
            curIndex = curArray.indexOf(oldHash[id]);

            if (i !== curIndex) {
                callback({
                    oldPath,
                    newPath,
                    type: MOVE_ITEM_EVENT,
                    newValue: newObj[i],
                    oldIndex,
                    curIndex,
                    newIndex: i,
                });

                curArray.splice(curIndex, 1);
                curArray.splice(i, 0, oldHash[id]);
            }

            diff(oldHash[id], newObj[i], Object.assign({}, ops, {
                callback,
                oldPath: oldPath.concat(oldIndex),
                newPath: newPath.concat(i),
            }));
        }
    }
    else {
        for (prop in oldObj) {
            if (!Object.prototype.hasOwnProperty.call(oldObj, prop))
                continue;

            if (!Object.prototype.hasOwnProperty.call(newObj, prop)) {
                callback({
                    oldPath: oldPath.concat(prop),
                    newPath: newPath.concat(prop),
                    type: REMOVE_EVENT,
                    oldValue: oldObj[prop],
                    newValue: undefined,
                });
                continue;
            }
            const comparator = comparators[oldPath.map(numberToAsterisk).join('.')]
                || comparators[oldPath.join('.')]
                || comparators[oldPath.concat(prop).map(numberToAsterisk).join('.')]
                || comparators[oldPath.concat(prop).join('.')];

            if (comparator) {
                if (!comparator(oldObj[prop], newObj[prop], {
                    oldPath: oldPath.concat(prop),
                    newPath: newPath.concat(prop),
                })) {
                    callback({
                        oldPath: oldPath.concat(prop),
                        newPath: newPath.concat(prop),
                        type: CHANGE_EVENT,
                        oldValue: oldObj[prop],
                        newValue: newObj[prop],
                    });
                }
                continue;
            }

            if (isObject(oldObj[prop]) && isObject(newObj[prop])) {
                diff(oldObj[prop], newObj[prop], Object.assign({}, ops, {
                    callback,
                    oldPath: oldPath.concat(prop),
                    newPath: newPath.concat(prop),
                }));
            }
            else if (oldObj[prop] !== newObj[prop]) {
                callback({
                    oldPath: oldPath.concat(prop),
                    newPath: newPath.concat(prop),
                    type: CHANGE_EVENT,
                    oldValue: oldObj[prop],
                    newValue: newObj[prop],
                });
            }
        }

        for (prop in newObj) {
            if (!Object.prototype.hasOwnProperty.call(newObj, prop))
                continue;

            if (!Object.prototype.hasOwnProperty.call(oldObj, prop)) {
                callback({
                    oldPath: oldPath.concat(prop),
                    newPath: newPath.concat(prop),
                    type: ADD_EVENT,
                    newValue: newObj[prop],
                });
            }
        }
    }

    return changes;
}

function indexBy(array: any[], id: string) {
    const hash: Record<string, any> = {};

    for (let i = 0, len = array.length; i < len; i++)
        hash[array[i][id]] = array[i];

    return hash;
}

function hashOf(array: any[]) {
    const hash: Record<string, any> = {};

    for (let i = 0, len = array.length; i < len; i++)
        hash[array[i]] = array[i];

    return hash;
}

function numberToAsterisk(value: number | string) {
    return typeof value === 'number' ? '*' : value;
}

export function applyChange(obj: Record<string, any>, base: Record<string, any>, source: Record<string, any>, diffEvent: DiffEvent, id: string) {
    if ([DiffType.Add, DiffType.Change].includes(diffEvent.type)) {
        // 只支持有一个数组下标，超过一个会有异常
        const findIndex = diffEvent.newPath.findIndex(item => typeof item === 'number');
        if (findIndex !== -1) {
            const newArrItem = get(source, diffEvent.newPath.slice(0, findIndex + 1));
            const arrItem = (get(obj, diffEvent.newPath.slice(0, findIndex)) || []).find((item: Record<string, any>) => {
                return item[id] === newArrItem[id];
            });

            set(arrItem, diffEvent.newPath.slice(findIndex + 1), diffEvent.newValue);
        }
        else {
            set(obj, diffEvent.newPath, diffEvent.newValue);
        }
    }
    else if (diffEvent.type === DiffType.Remove) {
        // 只支持有一个数组下标，超过一个会有异常
        const findIndex = diffEvent.oldPath.findIndex(item => typeof item === 'number');
        if (findIndex !== -1) {
            const newArrItem = get(base, diffEvent.oldPath.slice(0, findIndex + 1));
            const arrItem = (get(obj, diffEvent.oldPath.slice(0, findIndex)) || []).find((item: Record<string, any>) => {
                return item[id] === newArrItem[id];
            });

            unset(arrItem, diffEvent.oldPath.slice(findIndex + 1));
        }
        else {
            unset(obj, diffEvent.newPath);
        }
    }
    else if (diffEvent.type === DiffType.AddItem) {
        const arr = get(obj, diffEvent.newPath) || [];
        arr.splice(diffEvent.newIndex, 0, diffEvent.newIndex);
        set(obj, diffEvent.newPath, arr);
    }
    else if (diffEvent.type === DiffType.RemoveItem) {
        const arr = get(obj, diffEvent.newPath) || [];
        const removeIndex = arr.findIndex((item: Record<string, any>) => item[id] === diffEvent.oldValue[id]);
        arr.splice(removeIndex, 1);
    }
    else if (diffEvent.type === DiffType.MoveItem) {
        const arr = get(obj, diffEvent.newPath) || [];
        const removeIndex = arr.findIndex((item: Record<string, any>) => item[id] === diffEvent.newValue[id]);
        arr.splice(removeIndex, 1);
        arr.splice(diffEvent.newIndex, 0, diffEvent.newValue);
    }
}
