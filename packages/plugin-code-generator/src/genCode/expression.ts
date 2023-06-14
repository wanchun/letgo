import { replaceExpression } from '@webank/letgo-common';

export function parseExpression(text: string) {
    let result = text.trim();
    if (/^{{(.*?)}}$/.test(result)) {
        return replaceExpression(text, (_, expression) => {
            return expression;
        });
    }

    result = replaceExpression(text, (_, expression) => {
        return `\${${expression}}`;
    });
    return `\`${result}\``;
}

export function parseNormalValue(text: string) {
    let result = text.trim();
    try {
        result = JSON.parse(result);
        return result;
    }
    catch (_) {
        return result;
    }
}
