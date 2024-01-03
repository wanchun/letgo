import type {
    ICodeStruct,
    IPublicTypeCompositeObject,
    IPublicTypeNodeSchema,
} from '../..';

/**
 * 容器结构描述
 */
export interface IPublicTypeContainerSchema extends IPublicTypeNodeSchema {
    /**
     * 'Block' | 'Page' | 'Component';
     */
    componentName: string
    /**
     * 文件名称
     */
    fileName: string

    /**
     * 代码
     */
    code: ICodeStruct

    /**
     * 样式文件
     */
    css?: string
    /**
     * 低代码业务组件默认属性
     */
    defaultProps?: IPublicTypeCompositeObject
}
