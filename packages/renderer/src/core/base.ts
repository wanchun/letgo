import type { Component, PropType, VNodeProps } from 'vue';
import type {
    IPublicTypeAppConfig,
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
    __config: {
        type: Object as PropType<IPublicTypeAppConfig>,
    },
} as const;

export interface RendererProps {
    __schema: IPublicTypeRootSchema
    __components: Record<string, Component>
    __config: IPublicTypeAppConfig
}

export const baseRendererPropKeys = Object.keys(
    rendererProps,
) as (keyof RendererProps)[];

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
    comp?: Component | null
    scope: RuntimeScope
    schema: IPublicTypeNodeSchema
}

export const leafPropKeys = Object.keys(rendererProps) as (keyof LeafProps)[];

export interface LeafComponent {
    new (...args: any[]): {
        $props: VNodeProps & LeafProps
    }
}

export interface SlotSchemaMap {
    [x: string]: IPublicTypeSlotSchema | IPublicTypeNodeData[] | undefined
}

export interface PropSchemaMap {
    [x: string]: unknown
}
