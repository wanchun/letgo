import type { CodeItem, IPublicTypeEventHandler, IPublicTypeJSFunction } from '@webank/letgo-types';
import {
    CodeType,
    InnerEventHandlerAction,
} from '@webank/letgo-types';

import { extractExpression, findExpressionDependencyCode } from './transform-expression';

export const EXPRESSION_REGEX = /{{(.*?)}}/;

export function hasExpression(doc: string) {
    return EXPRESSION_REGEX.test(doc);
}

export function isOnlyExpression(doc: string) {
    return /^{{(.*?)}}$/.test(doc.trim());
}

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

export function eventHandlerToJsExpression(item: IPublicTypeEventHandler): IPublicTypeJSFunction {
    let expression: string;
    const params: any[] = [];
    if (item.action === InnerEventHandlerAction.CONTROL_QUERY) {
        expression = `${item.namespace}.${item.method}.apply(${item.namespace}, Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === InnerEventHandlerAction.CONTROL_COMPONENT) {
        // TODO 支持参数
        expression = `${item.namespace}.${item.method}()`;
    }
    else if (item.action === InnerEventHandlerAction.SET_TEMPORARY_STATE) {
        // TODO 支持其他方法
        params.push(item.params.value);
        expression = `${item.namespace}.${item.method}.apply(${item.namespace}, Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === InnerEventHandlerAction.SET_LOCAL_STORAGE) {
        // TODO 支持其他方法
        if (item.method === 'setValue') {
            params.push(item.params.key, item.params.value);
            expression = `${item.namespace}.${item.method}.apply(null, Array.prototype.slice.call(arguments))`;
        }
        else {
            expression = `${item.namespace}.${item.method}()`;
        }
    }
    else {
        // TODO 支持用户自定义方法
    }

    return {
        type: 'JSFunction',
        // 需要传下入参
        value: `function(){${expression}}`,
        params,
    };
}

export function eventHandlersToJsExpression(handlers: IPublicTypeEventHandler[]) {
    const result: {
        [key: string]: IPublicTypeJSFunction[]
    } = {};
    handlers.forEach((item: IPublicTypeEventHandler) => {
        if (item.namespace && item.method) {
            const jsExpression = eventHandlerToJsExpression(item);
            result[item.name] = (result[item.name] || []).concat(jsExpression);
        }
    });
    return result;
}
