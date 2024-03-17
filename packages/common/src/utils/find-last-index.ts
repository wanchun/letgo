import { isEmpty } from 'lodash-es';

export function findLastIndex<T>(arr: T[], callback: (item: T) => boolean) {
    let index = -1;

    if (!isEmpty(arr))
        index = arr.lastIndexOf([...arr].reverse().find(callback)!);

    return index;
}
