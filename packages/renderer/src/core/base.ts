import type { Component, ExtractPublicPropTypes, PropType } from 'vue';
import type {
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
    IPublicTypeSlotSchema,
} from '@webank/letgo-types';
import type { RuntimeScope } from '../utils';

export const HtmlCompWhitelist = ['a', 'img', 'div', 'span', 'svg', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'ul', 'li', 'ol', 'pre', 'code', 'blockquote', 'strong', 'em', 'i', 'address', 'article', 'aside', 'details', 'footer', 'header', 'hgroup', 'main', 'nav', 'section', 'summary', 'iframe'];

export const rendererProps = {
    __schema: {
        type: Object as PropType<IPublicTypeRootSchema>,
        required: true,
    },
    __components: {
        type: Object as PropType<Record<string, Component>>,
        required: true,
    },
    extraProps: {
        type: Object as PropType<Record<string, any>>,
        default: undefined as Record<string, any>,
    },
    isRoot: Boolean,
} as const;

export type RendererProps = ExtractPublicPropTypes<typeof rendererProps>;

export const leafProps = {
    comp: {
        type: [Object, Function, String] as PropType<Component | null>,
    },
    scope: {
        type: Object as PropType<RuntimeScope>,
        default: () => ({}),
    },
    schema: {
        type: Object as PropType<IPublicTypeNodeSchema>,
        default: () => ({}),
    },
} as const;

export interface LeafProps {
    comp?: Component | null;
    scope: RuntimeScope;
    schema: IPublicTypeNodeSchema;
}

export interface SlotSchemaMap {
    [x: string]: IPublicTypeSlotSchema | IPublicTypeNodeData[] | undefined;
}

export interface PropSchemaMap {
    [x: string]: unknown;
}
