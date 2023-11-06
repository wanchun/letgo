import { generate } from 'astring';
import { parse } from 'acorn';
import {
    CodeType,
    InnerEventHandlerAction,
    isRestQueryResource,
    isRunFunctionEventHandler,
    isSetLocalStorageEventHandler,
    isSetTemporaryStateEventHandler,
} from '@harrywan/letgo-types';
import type { CodeItem, IPublicTypeEventHandler, IPublicTypeJSFunction } from '@harrywan/letgo-types';
import { isNil } from 'lodash-es';
import { findGlobals, reallyParse } from './find-globals';

export function innerParse(code: string) {
    return parse(code, {
        allowReturnOutsideFunction: true,
        allowImportExportEverywhere: true,
        allowHashBang: true,
        ecmaVersion: 2022,
    });
}

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
    if (!code || code === '()')
        return [];
    const globalNodes = findGlobals(code);
    const dependencies: string[] = [];
    globalNodes.forEach((item) => {
        if (!ctx || !isNil(ctx[item.name]))
            dependencies.push(item.name);
    });
    return dependencies;
}

function handleEventDep(events: IPublicTypeEventHandler[]) {
    const result: string[] = [];
    if (events) {
        events.forEach((event) => {
            if ([InnerEventHandlerAction.SET_TEMPORARY_STATE, InnerEventHandlerAction.CONTROL_QUERY, InnerEventHandlerAction.RUN_FUNCTION].includes(event.action))
                result.push(event.namespace);
        });
    }
    return result;
}

export function calcDependencies(item: CodeItem, ctx?: Record<string, any>) {
    try {
        let result: string[] = [];
        if (item.type === CodeType.TEMPORARY_STATE)
            result = calcJSCodeDependencies(item.initValue ? `(${item.initValue})` : null, ctx);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED || item.type === CodeType.JAVASCRIPT_FUNCTION)
            result = calcJSCodeDependencies(item.funcBody, ctx);

        if (item.type === CodeType.JAVASCRIPT_QUERY) {
            if (isRestQueryResource(item)) {
                result = calcJSCodeDependencies(item.params ? `(${item.params})` : null, ctx);
                result = result.concat(handleEventDep(item.failureEvent));
                result = result.concat(handleEventDep(item.successEvent));
            }

            else { result = calcJSCodeDependencies(item.query, ctx); }
        }
        return Array.from(new Set(result));
    }
    catch (_) {
        return [];
    }
}

export function eventHandlerToJsFunction(item: IPublicTypeEventHandler): IPublicTypeJSFunction {
    let expression: string;
    const params: string[] = item.params ? item.params.filter(item => item) : [];
    if (isRunFunctionEventHandler(item)) {
        expression = `${item.namespace}(...Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === InnerEventHandlerAction.CONTROL_QUERY) {
        expression = `${item.namespace}.${item.method}.apply(${item.namespace}, Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === InnerEventHandlerAction.CONTROL_COMPONENT) {
        expression = `${item.namespace}.${item.method}(Array.prototype.slice.call(arguments))`;
    }
    else if (isSetTemporaryStateEventHandler(item)) {
        // TODO 支持其他方法
        expression = `${item.namespace}.${item.method}.apply(${item.namespace}, Array.prototype.slice.call(arguments))`;
    }
    else if (isSetLocalStorageEventHandler(item)) {
        // TODO 支持其他方法
        if (item.method === 'setValue')
            expression = `${item.namespace}.${item.method}.apply(null, Array.prototype.slice.call(arguments))`;

        else
            expression = `${item.namespace}.${item.method}()`;
    }
    else {
        // TODO 支持用户自定义方法
    }

    return {
        type: 'JSFunction',
        // 需要传下入参
        value: /^\s*function\s+/.test(expression) ? expression : `function(){${expression}}`,
        params,
    };
}

export function eventHandlersToJsFunction(handlers: IPublicTypeEventHandler[] = []) {
    const result: {
        [key: string]: IPublicTypeJSFunction[]
    } = {};
    handlers.forEach((item: IPublicTypeEventHandler) => {
        if ((item.namespace && item.method) || item.action === InnerEventHandlerAction.RUN_FUNCTION) {
            const jsExpression = eventHandlerToJsFunction(item);
            result[item.name] = (result[item.name] || []).concat(jsExpression);
        }
    });
    return result;
}
