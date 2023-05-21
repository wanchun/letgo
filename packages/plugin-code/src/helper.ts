import { EXPRESSION_REGEX } from './constants';

export function hasExpression(doc: string) {
    return EXPRESSION_REGEX.test(doc);
}

export function extractExpression(doc: string) {
    const result = new Set();
    const regex = new RegExp(EXPRESSION_REGEX, 'gs');
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(doc)) !== null)
        result.add(match[1].trim());

    return Array.from(result).filter(Boolean);
}

export function replaceExpression(doc: string, callback: (pattern: string, expression: string) => string) {
    const regex = new RegExp(EXPRESSION_REGEX, 'gs');
    return doc.replace(regex, callback);
}
