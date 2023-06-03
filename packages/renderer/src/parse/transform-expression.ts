import { parse } from 'acorn';
import { generate } from 'astring';
import { isNil, isUndefined } from 'lodash-es';

const EXPRESSION_REGEX = /{{(.*?)}}/;

export function hasExpression(doc: string) {
    return EXPRESSION_REGEX.test(doc);
}

export function extractExpression(doc: string) {
    const result = new Set<string>();
    const regex = new RegExp(EXPRESSION_REGEX, 'gs');
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(doc)) !== null)
        result.add(match[1].trim());

    return Array.from(result).filter(Boolean);
}

export function replaceExpression(doc: string, callback: (pattern: string, expression: string) => string) {
    const regex = new RegExp(EXPRESSION_REGEX, 'gs');
    return doc.replace(regex, callback);
}

interface Identifier {
    type: 'Identifier'
    start: number
    end: number
    name: string
}

interface MemberExpression {
    type: 'MemberExpression'
    object: Identifier | MemberExpression
    property: Identifier | MemberExpression
}

interface BinaryExpression {
    type: 'BinaryExpression'
    left: AstNode
    right: AstNode
}

interface CallExpression {
    type: 'CallExpression'
    callee: AstNode
    arguments: AstNode[]
}

interface UnaryExpression {
    type: 'UnaryExpression'
    argument: AstNode
}

type Callback = (identifier: Identifier) => void;

type AstNode = Identifier | MemberExpression | BinaryExpression | CallExpression | UnaryExpression;

function processVarIdentifier(expression: AstNode, callback: Callback) {
    if (expression.type === 'Identifier')
        callback(expression);

    else
        walkAst(expression, callback);
}

function walkAst(expression: AstNode, callback: Callback) {
    if (expression.type === 'Identifier') {
        callback(expression);
    }
    else if (expression.type === 'MemberExpression') {
        processVarIdentifier(expression.object, callback);
        if (expression.property.type !== 'Identifier')
            walkAst(expression.property, callback);
    }
    else if (expression.type === 'BinaryExpression') {
        processVarIdentifier(expression.left, callback);
        processVarIdentifier(expression.right, callback);
    }
    else if (expression.type === 'CallExpression') {
        processVarIdentifier(expression.callee, callback);
        expression.arguments.forEach((child) => {
            processVarIdentifier(child, callback);
        });
    }
    else if (expression.type === 'UnaryExpression') {
        processVarIdentifier(expression.argument, callback);
    }
    return expression;
}

//  * 要判断是不是表达式
//  * 要判断是不是有多个表达式
export function transformExpression(code: string, callback: Callback) {
    const ast = parse(code, {
        ecmaVersion: 2022,
    });
    const body = (ast as any).body;
    if (!body.length)
        return;
    if (body.length > 1)
        throw new Error('不支持多语句');

    else if (body[0].type !== 'ExpressionStatement')
        throw new Error('只支持 js 表达式');

    const content = body[0].expression;
    walkAst(content, callback);
    return content;
}

export function findExpressionDependencyCode(code: string, isInclude: (name: string) => boolean) {
    const result: string[] = [];
    transformExpression(code, (identifier) => {
        if (isInclude(identifier.name))
            result.push(identifier.name);
    });
    return result;
}

export function attachContext(code: string, isInclude: (name: string) => boolean) {
    const ast = transformExpression(code, (identifier) => {
        if (isInclude(identifier.name))
            identifier.name = `_ctx.${identifier.name}`;
    });
    return generate(ast);
}

export function executeExpression(text: string | null, ctx: Record<string, any>) {
    if (isNil(text))
        return null;
    let result = text;
    try {
        if (hasExpression(text)) {
            result = replaceExpression(text, (_, expression) => {
                const exp = attachContext(expression, name => !isUndefined(ctx[name]));
                // eslint-disable-next-line no-new-func
                const fn = new Function('_ctx', `return ${exp}`);
                return fn(ctx);
            });
        }
        result = JSON.parse(text);
        return result;
    }
    catch (_) {
        return result;
    }
}
