import type {
    IPublicTypeNodeSchema,
} from '@webank/letgo-types';
import { traverseNodeSchemaLogic } from './walk-schema-logic';
import { findGlobals } from './find-globals';

export function findSchemaLogic(nodeSchema: IPublicTypeNodeSchema) {
    const maybeLogicIds = new Set<string>();
    traverseNodeSchemaLogic(nodeSchema, (code: string, _, type) => {
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
