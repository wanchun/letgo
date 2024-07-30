import { generate } from 'astring';
import type { ExpressionStatement, Node, Program } from 'acorn';
import { parse } from 'acorn';
import { ancestor, simple } from 'acorn-walk';
import {
    IEnumCodeType,
    IEnumEventHandlerAction,
    IEnumRunScript,
    isJSExpression,
    isRestQueryResource,
    isRunFunctionEventHandler,
} from '@webank/letgo-types';
import type { ICodeItem, IEventHandler } from '@webank/letgo-types';
import { isNil } from 'lodash-es';
import { findGlobals, reallyParse } from './find-globals';
import { ASTParseOptions } from './constants';

export function parseToAst(code: string) {
    return parse(code, ASTParseOptions);
}

export function isFunctionString(code: string) {
    try {
        if (!code || !code.trim())
            return false;
        const ast = parseToAst(code);

        if (ast.body[0].type === 'FunctionDeclaration' || (ast.body[0] as ExpressionStatement).expression?.type === 'ArrowFunctionExpression')
            return true;

        return false;
    }
    catch (_) {
        return false;
    }
}

export function simpleWalkAst(code: string, param: Record<string, any>) {
    const ast = parseToAst(code);
    simple(ast, param);
    return ast;
}

export function ancestorWalkAst(code: string | Node, param: Record<string, any>) {
    const ast = typeof code === 'string' ? parseToAst(code) : code;
    ancestor(ast, param);

    return ast;
}

export function astToCode(ast: Program) {
    return generate(ast);
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
    if (ast.body[0].type === 'ExpressionStatement' && ast.body[0].expression.type === 'ArrowFunctionExpression')
        return generate(ast.body[0].expression);

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

export function calcDependencies(item: ICodeItem, ctx?: Record<string, any>, onError?: (err: unknown) => void) {
    try {
        let result: string[] = [];
        if (item.type === IEnumCodeType.TEMPORARY_STATE)
            result = calcJSCodeDependencies(item.initValue ? `(${item.initValue})` : null, ctx);

        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED || item.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
            result = calcJSCodeDependencies(item.funcBody, ctx).filter(name => item.id !== name); // 过滤自身依赖，可循环调用

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
    catch (err) {
        if (onError)
            onError(err);

        return [];
    }
}
