import type { Component, ExtractPublicPropTypes, PropType, VNodeProps } from 'vue';
import type {
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
    IPublicTypeSlotSchema,
} from '@webank/letgo-types';
import type { RuntimeScope } from '../utils';

export const rendererProps = {
    __schema: {
        type: Object as PropType<IPublicTypeRootSchema>,
        required: true,
    },
    __components: {
        type: Object as PropType<Record<string, Component>>,
        required: true,
    },
} as const;

export type RendererProps = ExtractPublicPropTypes<typeof rendererProps>;

export const leafProps = {
    comp: {
        type: Object as PropType<Component | null>,
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
