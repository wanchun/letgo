import type { CodeItem } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';
import { extractExpression, findExpressionDependencyCode } from '../parse';

export function calcDependencies(item: CodeItem, codeMap: Map<string, CodeItem>) {
    let dependencies: string[] = [];
    let inputCode: string;
    if (item.type === CodeType.TEMPORARY_STATE)
        inputCode = item.initValue;
    else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
        inputCode = item.funcBody;

    if (inputCode) {
        extractExpression(inputCode).forEach((expression) => {
            dependencies = dependencies.concat(findExpressionDependencyCode(expression, (name: string) => {
                return codeMap.has(name);
            }));
        });
    }

    return dependencies;
}
