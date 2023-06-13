export type IPublicTypeProp = IPublicTypeBasicProp | IPublicTypeRequiredProp | IPublicTypeComplexProp;
export type IPublicTypeBasicProp =
    | 'array'
    | 'bool'
    | 'func'
    | 'number'
    | 'object'
    | 'string'
    | 'node'
    | 'element'
    | 'date'
    | 'any';
export type IPublicTypeComplexProp =
    | IPublicTypeOneOf
    | IPublicTypeOneOfType
    | IPublicTypeArrayOf
    | IPublicTypeObjectOf
    | IPublicTypeShapeProp
    | IPublicTypeExactProp;

export interface IPublicTypeRequiredProp {
    type: IPublicTypeBasicProp
    isRequired?: boolean
}

export interface IPublicTypeOneOf {
    type: 'oneOf'
    value: string[]
    isRequired?: boolean
}
export interface IPublicTypeOneOfType {
    type: 'oneOfType'
    value: IPublicTypeProp[]
    isRequired?: boolean
}
export interface IPublicTypeArrayOf {
    type: 'arrayOf'
    value: IPublicTypeProp
    isRequired?: boolean
}
export interface IPublicTypeObjectOf {
    type: 'objectOf'
    value: IPublicTypeProp
    isRequired?: boolean
}
export interface IPublicTypeShapeProp {
    type: 'shape'
    value: IPublicTypePropConfig[]
    isRequired?: boolean
}
export interface IPublicTypeExactProp {
    type: 'exact'
    value: IPublicTypePropConfig[]
    isRequired?: boolean
}

/**
 * 组件属性信息
 */
export interface IPublicTypePropConfig {
    /**
     * 属性名称
     */
    name: string
    /**
     * 属性中文名
     */
    title?: string
    /**
     * 属性类型
     */
    propType: IPublicTypeProp
    /**
     * 属性描述
     */
    description?: string
    /**
     * 属性默认值
     */
    defaultValue?: any
}
