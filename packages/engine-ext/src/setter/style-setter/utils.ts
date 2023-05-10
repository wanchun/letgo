import type { INode } from '@webank/letgo-designer';
import { isElement, isNaN, isNil, isNumber, isString } from 'lodash-es';

export function getComputeStyle(node: INode): CSSStyleDeclaration | null {
    const simulator = node.document.simulator;

    const nodeInst = simulator.getComponentInstances(node)?.[0];

    if (!nodeInst)
        return null;

    const nativeNode = simulator.findDOMNodes(nodeInst)?.[0];
    if (isElement(nativeNode)) {
        try {
            return window.getComputedStyle(nativeNode as Element, null);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    return null;
}

/**
   * 获取提示属性值
   * @param cssStyle
   * @param property
   */
export function getPlaceholderPropertyValue(cssStyle: CSSStyleDeclaration, property: string) {
    const propertyValue = cssStyle.getPropertyValue(toLine(property));

    if (propertyValue !== 'auto' && propertyValue) {
        if (property !== 'backgroundColor')
            return clearUnit(propertyValue);

        else
            return hex(propertyValue);
    }

    return propertyValue;
}

export function addUnit(val: number | string, unit = 'px') {
    if (isNumber(val))
        return `${val}${unit}`;

    if (isString(val) && /^(-?\d+)(\.\d+)?$/.test(val)) {
        if (val.endsWith(unit))
            return val;

        return `${val}${unit}`;
    }
}

export function clearUnit(value: string | number | undefined) {
    if (isNil(value))
        return;
    if (isNumber(value))
        return value;
    const res = parseFloat(value);
    return isNaN(res) ? undefined : res;
}

/**
 * rgba转16进制
 * @param color
 */
export function hex(color: string) {
    const values = color
        .replace(/rgba?\(/, '')
        .replace(/\)/, '')
        .replace(/[\s+]/g, '')
        .split(',');
    const a = parseFloat(values[3]);
    const r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255);
    const g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255);
    const b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
    return (
        `#${
      (`0${r.toString(16)}`).slice(-2)
      }${(`0${g.toString(16)}`).slice(-2)
      }${(`0${b.toString(16)}`).slice(-2)}`
    );
}

/**
 * 将驼峰写法改成xx-xx的css命名写法
 * @param styleKey
 */
export function toLine(styleKey: string) {
    return styleKey.replace(/([A-Z])/g, '-$1').toLowerCase();
}
