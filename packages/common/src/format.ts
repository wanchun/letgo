import { format } from 'prettier/standalone';
import estree from 'prettier/plugins/estree';
import babel from 'prettier/plugins/babel';
import postcss from 'prettier/plugins/postcss';

export function formatJsCode(content: string, options?: Record<string, any>) {
    try {
        return format(content, {
            tabWidth: 4,
            singleQuote: true,
            vueIndentScriptAndStyle: true,
            parser: 'babel',
            plugins: [estree, babel],
            ...options,
        });
    }
    catch (e) {
        return content;
    }
}

export function formatCssCode(code: string, options?: Record<string, any>) {
    try {
        return format(code, {
            tabWidth: 4,
            singleQuote: true,
            vueIndentScriptAndStyle: true,
            parser: 'css',
            plugins: [postcss],
            ...options,
        });
    }
    catch (e) {
        return code;
    }
}

export async function formatExpression(expression: string) {
    if (!expression || !format)
        return expression;

    let result = await formatJsCode(`(${expression})`, { semi: false, trailingComma: 'none', tabWidth: 2 });
    result = result.trim();
    if (result.startsWith(';'))
        result = result.slice(1);

    if (result.startsWith('(') && result.endsWith(')'))
        return result.slice(1, -1);

    return result;
}
