import { parse } from 'acorn';
import { generate } from 'astring';
import { simple } from 'acorn-walk';
import { isNil, isUndefined } from 'lodash-es';

interface Identifier {
    type: 'Identifier'
    start: number
    end: number
    name: string
}

type Callback = (identifier: Identifier) => void;

export function transformExpression(code: string, callback: Callback) {
    const ast = parse(code, {
        allowReturnOutsideFunction: true,
        allowImportExportEverywhere: true,
        allowHashBang: true,
        ecmaVersion: 2022,
    });

    simple(ast, {
        Identifier(node) {
            callback(node as Identifier);
        },
    });
    return ast;
}

export function replaceExpressionIdentifier(code: string, newName: string, preName: string) {
    const ast = transformExpression(code, (identifier) => {
        if (identifier.name === preName)
            identifier.name = newName;
    });
    return generate(ast);
}

export function attachContext(code: string, isInclude: (name: string) => boolean) {
    const ast = transformExpression(code, (identifier) => {
        if (isInclude(identifier.name))
            identifier.name = `_ctx.${identifier.name}`;
    });
    return generate(ast);
}

export function executeExpression(text: string | null, ctx: Record<string, any> = {}) {
    if (isNil(text))
        return null;
    try {
        const exp = attachContext(text, name => !isUndefined(ctx[name]));
        // eslint-disable-next-line no-new-func
        const fn = new Function('_ctx', `return ${exp}`);
        return fn(ctx);
    }
    catch (_) {
        return null;
    }
}
