import { isSyntaxError } from '@webank/letgo-common';
import type { IPublicTypeJSExpression } from '@webank/letgo-types';

export function formatExpression(val: IPublicTypeJSExpression) {
    if (!val.value)
        return null;

    const expression = val.value.trim();
    if (isSyntaxError(expression))
        return JSON.stringify(expression);

    return expression;
}
