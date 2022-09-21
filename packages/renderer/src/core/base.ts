import type { NodeSchema, RootSchema } from '@webank/letgo-types';
import type { Node } from '@webank/letgo-designer';
import { Component, ComponentPublicInstance, PropType, VNodeProps } from 'vue';
import { BlockScope, RuntimeScope } from '../utils';

export const rendererProps = {
    __scope: {
        type: Object as PropType<BlockScope>,
    },
    __schema: {
        type: Object as PropType<RootSchema>,
        required: true,
    },
    __designMode: {
        type: String as PropType<'live' | 'design'>,
        default: 'live',
    },
    __components: {
        type: Object as PropType<Record<string, Component>>,
        required: true,
    },
    __locale: {
        type: String,
    },
    __getNode: {
        type: Function as PropType<(id: string) => Node<NodeSchema> | null>,
        required: true,
    },
    __triggerCompGetCtx: {
        type: Function as PropType<
            (schema: NodeSchema, ref: ComponentPublicInstance) => void
        >,
        required: true,
    },
} as const;

export interface RendererProps {
    __scope?: BlockScope;
    __locale?: string;
    __designMode?: 'live' | 'design';
    __schema: RootSchema;
    __components: Record<string, Component>;
    __getNode: (id: string) => Node<NodeSchema> | null;
    __triggerCompGetCtx: (
        schema: NodeSchema,
        ref: ComponentPublicInstance,
    ) => void;
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
