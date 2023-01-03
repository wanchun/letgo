import { Component, PropType, VNodeProps } from 'vue';
import { RuntimeScope } from '../utils';
import type {
    NodeSchema,
    RootSchema,
    NodeData,
    SlotSchema,
} from '@webank/letgo-types';

export const rendererProps = {
    __schema: {
        type: Object as PropType<RootSchema>,
        required: true,
    },
    __components: {
        type: Object as PropType<Record<string, Component>>,
        required: true,
    },
} as const;

export interface RendererProps {
    __schema: RootSchema;
    __components: Record<string, Component>;
}

export const baseRendererPropKeys = Object.keys(
    rendererProps,
) as (keyof RendererProps)[];

export type RendererComponent = {
    new (...args: any[]): {
        $props: VNodeProps & RendererProps;
    };
};

export const leafProps = {
    comp: {
        type: Object as PropType<Component | null>,
    },
    scope: {
        type: Object as PropType<RuntimeScope>,
        default: () => ({}),
    },
    schema: {
        type: Object as PropType<NodeSchema>,
        default: () => ({}),
    },
} as const;

export interface LeafProps {
    comp?: Component | null;
    scope: RuntimeScope;
    schema: NodeSchema;
}

export const leafPropKeys = Object.keys(rendererProps) as (keyof LeafProps)[];

export type LeafComponent = {
    new (...args: any[]): {
        $props: VNodeProps & LeafProps;
    };
};

export type SlotSchemaMap = {
    [x: string]: SlotSchema | NodeData[] | undefined;
};

export type PropSchemaMap = {
    [x: string]: unknown;
};
