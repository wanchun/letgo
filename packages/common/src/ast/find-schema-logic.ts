import type {
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import { traverseNodeSchema } from './walk-schema-logic';
import { findGlobals } from './find-globals';

export function findSchemaLogic(nodeSchema: IPublicTypeNodeSchema) {
    const maybeLogicIds = new Set<string>();
    traverseNodeSchema(nodeSchema, (code: string, _, type) => {
        try {
            code = type === 'JSExpression' ? `(${code})` : code;
            const globalNodes = findGlobals(code);

            globalNodes.forEach((item) => {
                maybeLogicIds.add(item.name);
            });
        }
        catch (_) {}
    });

    return Array.from(maybeLogicIds);
}
