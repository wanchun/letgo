import { isNaN, isNil, isNumber, isString } from 'lodash-es';

export function addUnit(val: number | string, unit = 'px') {
    if (isNumber(val))
        return `${val}${unit}`;

    if (isString(val) && /^(-?\d+)(\.\d+)?$/.test(val)) {
        if (val.endsWith(unit))
            return val;

        return `${val}${unit}`;
    }

    return val;
}

export function clearUnit(value: string | number | undefined) {
    if (isNil(value))
        return;
    if (isNumber(value))
        return value;
    const res = parseFloat(value);
    return isNaN(res) ? value : res;
}
