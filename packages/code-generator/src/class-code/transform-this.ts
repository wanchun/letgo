import { replaceExpressionIdentifier, transformNodeSchemaCode } from '@webank/letgo-common';
import type { IPublicTypeRootSchema } from '@webank/letgo-types';

export function transformThis(rootSchema: IPublicTypeRootSchema) {
    if (!rootSchema.classCode)
        return rootSchema;

    transformNodeSchemaCode(rootSchema, (code, _, type) => {
        try {
            if (!code)
                return;

            code = type === 'JSExpression' ? `(${code})` : code;
            return replaceExpressionIdentifier(code, '$$', 'this');
        }
        catch (_) {
            return code;
        }
    });

    return rootSchema;
}
