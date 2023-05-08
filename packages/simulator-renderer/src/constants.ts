import type { InjectionKey } from 'vue';
import type { INode } from '@webank/letgo-designer';
import type { IPublicTypeComponentInstance, IPublicTypeNodeSchema } from '@webank/letgo-types';

export const BASE_COMP_CONTEXT: InjectionKey<{
    getNode(id: string): INode | null
    onCompGetCtx(schema: IPublicTypeNodeSchema, val: IPublicTypeComponentInstance): void
}> = Symbol('__appContext');
