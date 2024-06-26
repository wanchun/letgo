import { generate } from 'astring';
import type { ExpressionStatement } from 'acorn';
import { parse } from 'acorn';
import { ancestor, simple } from 'acorn-walk';
import {
    IEnumCodeType,
    IEnumEventHandlerAction,
    IEnumRunScript,
    isJSExpression,
    isRestQueryResource,
    isRunFunctionEventHandler,
    isSetLocalStorageEventHandler,
    isSetTemporaryStateEventHandler,
} from '@webank/letgo-types';
import type { ICodeItem, IEventHandler, IPublicTypeJSFunction } from '@webank/letgo-types';
import { isNil } from 'lodash-es';
import { findGlobals, reallyParse } from './find-globals';
import { ASTParseOptions } from './constants';

export function innerParse(code: string) {
    return parse(code, ASTParseOptions);
}

export function isFunction(code: string) {
    try {
        if (!code || !code.trim())
            return false;
        const ast = innerParse(code);

        if (ast.body[0].type === 'FunctionDeclaration' || (ast.body[0] as ExpressionStatement).expression?.type === 'ArrowFunctionExpression')
            return true;

        return false;
    }
    catch (_) {
        return false;
    }
}

export function simpleWalkAst(code: string, param: Record<string, any>) {
    const ast = innerParse(code);
    simple(ast, param);
    return ast;
}

export function ancestorWalkAst(code: string, param: Record<string, any>) {
    const ast = innerParse(code);
    ancestor(ast, param);

    return ast;
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

function handleEventDep(events: IEventHandler[], item: ICodeItem, ctx?: Record<string, any>) {
    let result: string[] = [];
    if (events) {
        events.forEach((event) => {
            if (isRunFunctionEventHandler(event)) {
                // 事件绑定是函数的时候，支持写自身，以实现轮询等场景
                if (event.type === IEnumRunScript.PLAIN)
                    result = result.concat(calcJSCodeDependencies(event.funcBody, ctx).filter(name => item.id !== name));
                else if (event.namespace)
                    result.push(event.namespace);
            }
            else if (event.namespace && [IEnumEventHandlerAction.SET_TEMPORARY_STATE, IEnumEventHandlerAction.CONTROL_QUERY].includes(event.action)) {
                result.push(event.namespace);
            }
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
                result = item.params ? calcJSCodeDependencies(`(${item.params})`, ctx) : [];
                if (isJSExpression(item.headers) && item.headers.value)
                    result = result.concat(calcJSCodeDependencies(`(${item.headers.value})`, ctx));

                result = result.concat(handleEventDep(item.failureEvent, item, ctx));
                result = result.concat(handleEventDep(item.successEvent, item, ctx));
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
        if (item.type === IEnumRunScript.PLAIN)
            expression = item.funcBody;
        else
            expression = `${item.namespace}(...args)`;
    }
    else if (item.action === IEnumEventHandlerAction.CONTROL_QUERY) {
        expression = `${item.namespace}.${item.method}()`;
    }
    else if (item.action === IEnumEventHandlerAction.CONTROL_COMPONENT) {
        expression = `${item.namespace}.${item.method}(...args)`;
    }
    else if (isSetTemporaryStateEventHandler(item)) {
        // param: 0 value, 1: path，因此需要对数组进行倒序
        params.reverse();
        expression = `${item.namespace}.${item.method}(...args)`;
    }
    else if (isSetLocalStorageEventHandler(item)) {
        // TODO 支持其他方法
        if (item.method === 'setValue')
            expression = `${item.namespace}.${item.method}(...args)`;

        else
            expression = `${item.namespace}.${item.method}()`;
    }

    return {
        type: 'JSFunction',
        // 需要传下入参
        value: isFunction(expression) ? expression : `(...args) => {${expression}}`,
        params,
    };
}

export function eventHandlersToJsFunction(handlers: IEventHandler[] = []) {
    const result: {
        [key: string]: IPublicTypeJSFunction[];
    } = {};
    handlers.forEach((item: IEventHandler) => {
        const jsFuncs: IPublicTypeJSFunction[] = result[item.name] || [];
        if (isRunFunctionEventHandler(item) && (item.namespace || item.funcBody))
            jsFuncs.push(eventHandlerToJsFunction(item));

        else if ((item.namespace && item.method))
            jsFuncs.push(eventHandlerToJsFunction(item));

        result[item.name] = jsFuncs;
    });
    return result;
}
