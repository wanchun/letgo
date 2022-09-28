import { Component, ComponentPublicInstance, PropType, VNodeProps } from 'vue';
import { RuntimeScope } from '../utils';
import type {
    NodeSchema,
    RootSchema,
    NodeData,
    JSExpression,
    DOMText,
} from '@webank/letgo-types';
import type { Node } from '@webank/letgo-designer';

export const rendererProps = {
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

export type SlotSchemaMap = {
    default: RenderNode[];
    [x: string]: NodeData | NodeData[] | undefined;
};

export type RenderNode = NodeSchema | JSExpression | DOMText;
