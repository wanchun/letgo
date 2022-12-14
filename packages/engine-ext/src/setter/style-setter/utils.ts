import { isNumber, isString, isNil, isNaN } from 'lodash-es';

export const addUnit = (val: number | string, unit = 'px') => {
    if (isNumber(val)) {
        return `${val}${unit}`;
    }
    if (isString(val) && /^(-?\d+)(\.\d+)?$/.test(val)) {
        if (val.endsWith(unit)) {
            return val;
        }
        return `${val}${unit}`;
    }

    return;
};

export const clearUnit = (value: string | number | undefined) => {
    if (isNil(value)) return;
    if (isNumber(value)) return value;
    const res = parseFloat(value);
    return isNaN(res) ? undefined : res;
};
