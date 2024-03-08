import type { IPublicTypeCompositeObject, IPublicTypeContainerSchema } from '../..';

/**
 * 低代码业务组件容器
 */
export interface IPublicTypeComponentSchema extends IPublicTypeContainerSchema {
    componentName: 'Component';

    /**
     * 低代码业务组件默认属性
     */
    defaultProps?: IPublicTypeCompositeObject;
}
