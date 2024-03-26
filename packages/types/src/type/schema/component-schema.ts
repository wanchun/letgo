import type { IPublicTypeCompositeObject, IPublicTypeContainerSchema } from '../..';

interface Option {
    label: string;
    value: string | number | boolean;
}

export enum IPublicEnumJSType {
    String = 'String',
    Number = 'Number',
    Boolean = 'Boolean',
    Array = 'Array',
    Object = 'Object',
    Function = 'Function',
}

interface DefinedProp {
    name: string;
    title: string;
    type?: IPublicEnumJSType;
    propSetter?: string;
    items?: Option[];
    arrayItemType?: IPublicEnumJSType;
    arrayItems?: DefinedProp[];
    objectItems?: DefinedProp[];
}

/**
 * 低代码业务组件容器
 */
export interface IPublicTypeComponentSchema extends IPublicTypeContainerSchema {
    componentName: 'Component';

    /**
     * 低代码业务组件属性定义
     */
    definedProps?: DefinedProp[];
    /**
     * 低代码业务组件默认属性
     */
    defaultProps?: IPublicTypeCompositeObject;
}
