import { toCSS } from './toCSS';
import type { JSONNode } from './toJSON';

export const strNode = function (
    name: string,
    value: JSONNode,
  depth = 0,
): string {
    let cssString = '';
    for (let i = 0; i <= depth; ++i)
        cssString += '  ';

    cssString += `${name.replace(/&&&\d+&&&/, '')} {\n`;
    cssString += toCSS(value, depth + 1);
    for (let i = 0; i <= depth; ++i)
        cssString += '  ';

    cssString += '}\n';
    return cssString;
};
