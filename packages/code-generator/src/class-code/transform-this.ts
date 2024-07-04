import { transformNodeSchemaCode, transformThisExpression } from '@webank/letgo-common';
import type { IPublicTypeRootSchema } from '@webank/letgo-types';
import { cloneDeep } from 'lodash-es';

export function transformThis(rootSchema: IPublicTypeRootSchema) {
    if (!rootSchema.classCode)
        return rootSchema;

    const newRootSchema = cloneDeep(rootSchema);
    transformNodeSchemaCode(newRootSchema, (code, _, type) => {
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

    return newRootSchema;
}
