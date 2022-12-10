import type { InjectionKey } from 'vue';
import type { Node } from '@webank/letgo-designer';
import type { NodeSchema, ComponentInstance } from '@webank/letgo-types';

export const BASE_COMP_CONTEXT: InjectionKey<{
    getNode(id: string): Node<NodeSchema> | null;
    onCompGetCtx(schema: NodeSchema, val: ComponentInstance): void;
}> = Symbol('__appContext');
