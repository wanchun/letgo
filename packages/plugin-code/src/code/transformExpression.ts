import { parse } from 'acorn';
import { generate } from 'astring';

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
function transformExpression(code: string, callback: Callback) {
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

export function findDependencyState(code: string, isInclude: (name: string) => boolean) {
    const result: string[] = [];
    transformExpression(code, (identifier) => {
        if (isInclude(identifier.name))
            result.push(identifier.name);
    });
    return result;
}

export function attachContext(code: string, isExclude: (name: string) => boolean) {
    const ast = transformExpression(code, (identifier) => {
        if (!isExclude(identifier.name))
            identifier.name = `_ctx.${identifier.name}`;
    });
    return generate(ast);
}
