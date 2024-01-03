import type {
    IPublicTypeBlockSchema,
    IPublicTypeComponentSchema,
    IPublicTypePageSchema,
} from '../..';

export type IPublicTypeRootSchema = IPublicTypePageSchema | IPublicTypeComponentSchema | IPublicTypeBlockSchema;
