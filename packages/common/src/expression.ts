export const EXPRESSION_REGEX = /{{(.*?)}}/;

export function hasExpression(doc: string) {
    return EXPRESSION_REGEX.test(doc);
}
