import { generate } from 'astring';
import { simple } from 'acorn-walk';
import { isNil } from 'lodash-es';
import type { ThisExpression } from 'acorn';
import { parseToAst } from './ast';

interface Identifier {
    type: 'Identifier';
    start: number;
    end: number;
    name: string;
}

type Callback = (identifier: Identifier) => void;

export function isSyntaxError(code: string): boolean {
    try {
        parseToAst(code);
        return false;
    }
    catch (_) {
        return true;
    }
}

export function transformExpression(code: string, callback: Callback) {
    const ast = parseToAst(code);

    simple(ast, {
        Identifier(node) {
            callback(node as Identifier);
        },
    });
    return ast;
}

export function transformThisExpression(code: string, callback: (node: ThisExpression) => Identifier) {
    try {
        const ast = parseToAst(code);

        simple(ast, {
            ThisExpression(node) {
                callback(node as ThisExpression);
            },
        });

        const result = generate((ast as any).body[0]);

        if (result.endsWith(';'))
            return result.slice(0, -1);

        return result;
    }
    catch (err) {
        console.warn(err);
        return code;
    }
}

export function replaceExpressionIdentifier(code: string, newName: string, preName: string) {
    if (!code)
        return code;
    try {
        const ast = transformExpression(code, (identifier) => {
            if (identifier.name === preName)
                identifier.name = newName;
        });

        const result = generate((ast as any).body[0]);
        if (result.endsWith(';'))
            return result.slice(0, -1);

        return result;
    }
    catch (err) {
        console.warn(err);
        return code;
    }
}

export function attachContext(code: string, isInclude: (name: string) => boolean) {
    try {
        const ast = transformExpression(code, (identifier) => {
            if (isInclude(identifier.name))
                identifier.name = `_ctx.${identifier.name}`;
        });
        const result = generate((ast as any).body[0]);
        if (result.endsWith(';'))
            return result.slice(0, -1);

        return result;
    }
    catch (err) {
        console.warn(err);
        return code;
    }
}

export function isExpression(code: string, isInclude: (name: string) => boolean) {
    try {
        let flag = false;
        if (!code || !code.trim())
            return false;
        code = `(${code.trim()})`;
        transformExpression(code, (identifier) => {
            if (isInclude(identifier.name))
                flag = true;
        });

        if (flag === false) {
            // eslint-disable-next-line no-eval
            eval(code);
            // 可执行，为表达式
            flag = true;
        }

        return flag;
    }
    catch (_) {
        return false;
    }
}
