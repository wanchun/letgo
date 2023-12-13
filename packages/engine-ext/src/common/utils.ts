import type { INode } from '@webank/letgo-designer';
import { isElement, isNaN, isNil, isNumber, isString } from 'lodash-es';
import type { CssAttributes, JSONNode } from './css-json';
import { toCSS, toJSON } from './css-json';

export function getComputeStyle(node: INode): Record<string, any> | null {
    const simulator = node.document.simulator;

    const nodeInst = simulator.getComponentInstances(node)?.[0];

    if (!nodeInst)
        return null;

    const nativeNode = simulator.findDOMNodes(nodeInst)?.[0];
    if (isElement(nativeNode)) {
        try {
            const res: Record<string, any> = {};
            const _res = window.getComputedStyle(nativeNode as Element, null);
            for (let i = 0; i < _res.length; i++) {
                const propertyName: string = _res.item(i);
                res[propertyName] = _res.getPropertyValue(propertyName);
            }
            return res;
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
export function getPlaceholderPropertyValue(cssStyle: Record<string, any> | null, property: string) {
    const propertyValue = cssStyle?.[toLine(property)];

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

    return val;
}

export function clearUnit(value: string | number | undefined) {
    if (isNil(value))
        return;
    if (isNumber(value))
        return value;
    const res = Number.parseFloat(value);
    return isNaN(res) ? undefined : res;
}

export function clearUnit2(value: string | number | undefined) {
    if (isNil(value))
        return;
    if (isNumber(value))
        return value;
    const res = Number.parseFloat(value);
    return isNaN(res) ? value : res;
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
    const a = Number.parseFloat(values[3]);
    const r = Math.floor(a * Number.parseInt(values[0]) + (1 - a) * 255);
    const g = Math.floor(a * Number.parseInt(values[1]) + (1 - a) * 255);
    const b = Math.floor(a * Number.parseInt(values[2]) + (1 - a) * 255);
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

export function toHump(name: string) {
    return name.replace(/\-(\w)/g, (all, letter) => {
        return letter.toUpperCase();
    });
}

export function parseToCssCode(styleData: Record<string, any>) {
    const parseStyleData: CssAttributes = {};
    for (const styleKey in styleData)
        parseStyleData[toLine(styleKey)] = styleData[styleKey];

    const cssJson: JSONNode = {
        children: {
            '#main': {
                children: {},
                attributes: parseStyleData,
            },
        },
        attributes: {},
    };

    return toCSS(cssJson);
}

export function parseToStyleData(cssCode: string) {
    const styleData: Record<string, string | number> = {};
    try {
        const cssJson = toJSON(cssCode);
        const mainKey = Object.keys(cssJson?.children).filter((key) => {
            return key.includes('#main');
        })?.[0];
        if (mainKey) {
            const cssJsonData = cssJson?.children?.[mainKey]?.attributes;
            for (const key in cssJsonData)
                styleData[toHump(key)] = cssJsonData[key];
        }

        return styleData;
    }
    catch (e: unknown) {
        console.error((e as Error).message);
        return null;
    }
}
