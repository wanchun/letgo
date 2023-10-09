import type { IPublicTypeBlockSchema, IPublicTypeComponentSchema, IPublicTypePageSchema } from '@harrywan/letgo-types';

const flag = {
    Page: 1,
    Component: 1,
    Block: 1,
};

export function genFileName(schema: IPublicTypePageSchema | IPublicTypeComponentSchema | IPublicTypeBlockSchema) {
    return schema.fileName || flag[schema.componentName]++;
}
