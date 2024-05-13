import { generate } from 'astring';
import { simple } from 'acorn-walk';
import { isNil, isUndefined } from 'lodash-es';
import { innerParse } from './ast';

interface Identifier {
    type: 'Identifier';
    start: number;
    end: number;
    name: string;
}

type Callback = (identifier: Identifier) => void;

export function isSyntaxError(code: string): boolean {
    try {
        innerParse(code);
        return false;
    }
    catch (_) {
        return true;
    }
}

export function transformExpression(code: string, callback: Callback) {
    const ast = innerParse(code);

    simple(ast, {
        Identifier(node) {
            callback(node as Identifier);
        },
    });
    return ast;
}

export function replaceExpressionIdentifier(code: string, newName: string, preName: string) {
    if (!code)
        return code;
    try {
        const ast = transformExpression(code, (identifier) => {
            if (identifier.name === preName)
                identifier.name = newName;
        });
        return generate((ast as any).body[0]).replace(';', '');
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
        return generate((ast as any).body[0]).replace(';', '');
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

export function executeExpression(text: string | null, ctx: Record<string, any> = {}, whenErrorReturnRaw = false) {
    if (isNil(text))
        return undefined;
    try {
        const exp = attachContext(`(${text})`, name => !isUndefined(ctx[name]));
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', `return ${exp}`);
        return fn(ctx);
    }
    catch (_) {
        if (whenErrorReturnRaw)
            return text;
        return undefined;
    }
}
