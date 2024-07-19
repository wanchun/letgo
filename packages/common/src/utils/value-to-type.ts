import { isFunction, isNumber, isPlainObject, isString } from 'lodash-es';

export function valueToType(val: unknown, maxLevel: number = 3, level: number = 0): string {
    if (isNumber(val))
        return 'number';

    if (isString(val))
        return 'string';

    if (isFunction(val))
        return '(...args: any[]) => any';

    if (Array.isArray(val))
        return val[0] ? `${valueToType(val[0], maxLevel, level + 1)}[]` : `[]`;

    if (isPlainObject(val)) {
        if (level < maxLevel) {
            return `{
                ${Object.keys(val).map(key => `${key}: ${valueToType(val[key as keyof typeof val], maxLevel, level + 1)}`).join(',\n')}
            }`;
        }
        return `Record<string, any>`;
    }
    return 'any';
}
