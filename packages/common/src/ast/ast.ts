import { generate } from 'astring';
import type { CodeItem, IPublicTypeEventHandler, IPublicTypeJSFunction } from '@webank/letgo-types';
import {
    CodeType,
    InnerEventHandlerAction,
} from '@webank/letgo-types';
import { isNil } from 'lodash-es';
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

export function calcJSCodeDependencies(code: string, ctx?: Record<string, any>) {
    const globalNodes = findGlobals(code);
    const dependencies: string[] = [];
    globalNodes.forEach((item) => {
        if (!ctx || !isNil(ctx[item.name]))
            dependencies.push(item.name);
    });
    return dependencies;
}

export function calcDependencies(item: CodeItem, ctx?: Record<string, any>) {
    try {
        if (item.type === CodeType.TEMPORARY_STATE)
            return calcJSCodeDependencies(item.initValue, ctx);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
            return calcJSCodeDependencies(item.funcBody, ctx);

        else if (item.type === CodeType.JAVASCRIPT_QUERY)
            return calcJSCodeDependencies(item.query, ctx);
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