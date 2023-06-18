import { generate } from 'astring';
import type { CodeItem, IJavascriptQuery, IPublicTypeEventHandler, IPublicTypeJSFunction } from '@webank/letgo-types';
import {
    CodeType,
    InnerEventHandlerAction,
} from '@webank/letgo-types';
import { extractExpression, findExpressionDependencyCode, hasExpression } from './expression';
import { findGlobals, reallyParse } from './find-globals';

export function replaceJSFunctionIdentifier(code: string, newName: string, preName: string) {
    const ast = reallyParse(code);
    const globalNodes = findGlobals(ast);
    globalNodes.forEach((item) => {
        if (item.name === preName) {
            item.nodes.forEach((node: any) => {
                node.name = newName;
            });
        }
    });
    return generate(ast);
}

export function calcJSQueryDependencies(item: IJavascriptQuery, codeMap: Map<string, CodeItem>) {
    const globalNodes = findGlobals(item.query);
    const dependencies: string[] = [];
    globalNodes.forEach((item) => {
        if (codeMap.has(item.name))
            dependencies.push(item.name);
    });
    return dependencies;
}

export function calcExpressionDependencies(input: string, codeMap: Map<string, CodeItem>) {
    let dependencies: string[] = [];
    if (input && hasExpression(input)) {
        extractExpression(input).forEach((expression) => {
            dependencies = dependencies.concat(findExpressionDependencyCode(expression, (name: string) => {
                return codeMap.has(name);
            }));
        });
    }
    return dependencies;
}

export function calcDependencies(item: CodeItem, codeMap: Map<string, CodeItem>) {
    try {
        if (item.type === CodeType.TEMPORARY_STATE)
            return calcExpressionDependencies(item.initValue, codeMap);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
            return calcExpressionDependencies(item.funcBody, codeMap);

        else if (item.type === CodeType.JAVASCRIPT_QUERY)
            return calcJSQueryDependencies(item, codeMap);
    }
    catch (_) {
        return [];
    }

    throw new Error('[letgo]: unknown code item: ', item);
}

export function eventHandlerToJsFunction(item: IPublicTypeEventHandler): IPublicTypeJSFunction {
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

export function eventHandlersToJsFunction(handlers: IPublicTypeEventHandler[]) {
    const result: {
        [key: string]: IPublicTypeJSFunction[]
    } = {};
    handlers.forEach((item: IPublicTypeEventHandler) => {
        if (item.namespace && item.method) {
            const jsExpression = eventHandlerToJsFunction(item);
            result[item.name] = (result[item.name] || []).concat(jsExpression);
        }
    });
    return result;
}
