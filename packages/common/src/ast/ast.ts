import { generate } from 'astring';
import { parse } from 'acorn';
import {
    IEnumCodeType,
    IEnumEventHandlerAction,
    isRestQueryResource,
    isRunFunctionEventHandler,
    isSetLocalStorageEventHandler,
    isSetTemporaryStateEventHandler,
} from '@webank/letgo-types';
import type { ICodeItem, IEventHandler, IPublicTypeJSFunction } from '@webank/letgo-types';
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

function handleEventDep(events: IEventHandler[]) {
    const result: string[] = [];
    if (events) {
        events.forEach((event) => {
            if ([IEnumEventHandlerAction.SET_TEMPORARY_STATE, IEnumEventHandlerAction.CONTROL_QUERY, IEnumEventHandlerAction.RUN_FUNCTION].includes(event.action))
                result.push(event.namespace);
        });
    }
    return result;
}

export function calcDependencies(item: ICodeItem, ctx?: Record<string, any>) {
    try {
        let result: string[] = [];
        if (item.type === IEnumCodeType.TEMPORARY_STATE)
            result = calcJSCodeDependencies(item.initValue ? `(${item.initValue})` : null, ctx);

        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED || item.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
            result = calcJSCodeDependencies(item.funcBody, ctx);

        if (item.type === IEnumCodeType.JAVASCRIPT_QUERY) {
            if (isRestQueryResource(item)) {
                result = calcJSCodeDependencies(item.params ? `(${item.params})` : null, ctx);
                result = result.concat(handleEventDep(item.failureEvent));
                result = result.concat(handleEventDep(item.successEvent));
            }
            else {
                result = calcJSCodeDependencies(item.query, ctx);
            }
            if (item.transformer && item.enableTransformer)
                result = result.concat(calcJSCodeDependencies(item.transformer, ctx));
        }
        return Array.from(new Set(result));
    }
    catch (_) {
        return [];
    }
}

export function eventHandlerToJsFunction(item: IEventHandler): IPublicTypeJSFunction {
    let expression: string;
    const params: string[] = item.params ? item.params.filter(item => item) : [];
    if (isRunFunctionEventHandler(item)) {
        expression = `${item.namespace}(...Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === IEnumEventHandlerAction.CONTROL_QUERY) {
        expression = `${item.namespace}.${item.method}.apply(${item.namespace}, Array.prototype.slice.call(arguments))`;
    }
    else if (item.action === IEnumEventHandlerAction.CONTROL_COMPONENT) {
        expression = `${item.namespace}.${item.method}(Array.prototype.slice.call(arguments))`;
    }
    else if (isSetTemporaryStateEventHandler(item)) {
        // param: 0 value, 1: path，因此需要对数组进行倒序
        params.reverse();
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

export function eventHandlersToJsFunction(handlers: IEventHandler[] = []) {
    const result: {
        [key: string]: IPublicTypeJSFunction[]
    } = {};
    handlers.forEach((item: IEventHandler) => {
        if ((item.namespace && item.method) || item.action === IEnumEventHandlerAction.RUN_FUNCTION) {
            const jsExpression = eventHandlerToJsFunction(item);
            result[item.name] = (result[item.name] || []).concat(jsExpression);
        }
    });
    return result;
}
