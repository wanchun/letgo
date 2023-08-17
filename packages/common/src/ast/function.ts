import { generate } from 'astring';
import { innerParse } from './ast';

export function replaceFunctionName(code: string, name: string) {
    if (!code)
        return code;
    const ast: any = innerParse(code);
    if (ast.body[0].type === 'FunctionDeclaration')
        ast.body[0].id.name = name;

    return generate((ast as any).body[0]).replace(';', '');
}
