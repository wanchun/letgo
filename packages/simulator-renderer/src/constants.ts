import type { InjectionKey } from 'vue';
import type { Node } from '@webank/letgo-designer';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';

export const BASE_COMP_CONTEXT: InjectionKey<{
    getNode(id: string): Node<IPublicTypeNodeSchema> | null
    onCompGetCtx(schema: IPublicTypeNodeSchema, val: IPublicTypeComponentInstance): void
}> = Symbol('__appContext');
