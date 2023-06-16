import { hasExpression, isOnlyExpression, replaceExpression } from '@webank/letgo-common';

export function parseFuncBody(text: string) {
    return replaceExpression(text, (_, expression) => {
        return expression;
    });
}

export function parseExpression(text: string) {
    let result = text.trim();
    if (isOnlyExpression(result)) {
        return replaceExpression(text, (_, expression) => {
            return expression.trim();
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
    }
    catch (_) {
    }
    if (typeof result === 'string')
        return JSON.stringify(result);

    return result;
}

export function parseInput(text: string) {
    if (hasExpression(text))
        return parseExpression(text);

    return parseNormalValue(text);
}
