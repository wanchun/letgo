import { transformNodeSchemaCode, transformThisExpression } from '@webank/letgo-common';
import type { IPublicTypeRootSchema } from '@webank/letgo-types';

export function transformThis(rootSchema: IPublicTypeRootSchema) {
    if (!rootSchema.classCode)
        return rootSchema;

    transformNodeSchemaCode(rootSchema, (code, _, type) => {
        try {
            if (!code)
                return;

            code = type === 'JSExpression' ? `(${code})` : code;
            const result = transformThisExpression(code, (node: any) => {
                node.type = 'Identifier';
                node.name = '$$';
                return node;
            });
            return result;
        }
        catch (_) {
            return code;
        }
    });

    return rootSchema;
}
