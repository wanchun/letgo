import { generate } from 'astring';
import { parseToAst } from './ast';

export function replaceFunctionName(code: string, name: string) {
    if (!code)
        return code;
    try {
        const ast: any = parseToAst(code);
        if (ast.body[0].type === 'FunctionDeclaration')
            ast.body[0].id.name = name;

        return generate(ast);
    }
    catch (err) {
        console.log(code, err);
        return code;
    }
}
