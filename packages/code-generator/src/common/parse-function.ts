import { astToCode, parseToAst } from '@webank/letgo-common';
import type { ExpressionStatement, FunctionDeclaration } from 'acorn';

export function parseFunctionCode(code: string, id: string): string {
    try {
        if (!code || !code.trim())
            return '';
        const ast = parseToAst(code);

        if ((ast.body[0] as ExpressionStatement).expression?.type === 'ArrowFunctionExpression') {
            ast.body[0] = {
                ...(ast.body[0] as ExpressionStatement).expression,
                type: 'FunctionDeclaration',
                id: {
                    type: 'Identifier',
                    name: id,
                    start: 0,
                    end: 0,
                },
            } as FunctionDeclaration;
        }
        else if (ast.body[0].type === 'FunctionDeclaration') {
            ast.body[0].id.name = id;
        }

        return astToCode(ast);
    }
    catch (_) {
        return '';
    }
}
