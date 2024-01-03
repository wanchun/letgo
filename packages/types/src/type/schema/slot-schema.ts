import type {
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
} from '../..';

/**
 * Slot schema 描述
 */
export interface IPublicTypeSlotSchema extends IPublicTypeNodeSchema {
    componentName: 'Slot'
    title?: string
    name?: string
    props?: {
        params?: string[]
    }
    children?: IPublicTypeNodeData[] | IPublicTypeNodeData
}

export function isSlotSchema(data: any): data is IPublicTypeSlotSchema {
    return data && data.componentName && data.componentName === 'Slot';
}
