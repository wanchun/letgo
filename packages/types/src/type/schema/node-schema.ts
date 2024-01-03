import type {
    IEventHandler,
    IPublicTypeCompositeValue,
    IPublicTypeDirective,
    IPublicTypeNodeData,
    IPublicTypePropsMap,
} from '../..';

/**
 * 搭建基础协议 - 单个组件树节点描述
 */
export interface IPublicTypeNodeSchema {
    id?: string
    /**
     * 组件 ref
     */
    ref?: string
    /**
     * 组件名称 必填、首字母大写
     */
    componentName: string
    /**
     * 组件中文名
     */
    title?: string
    /**
     * 组件描述
     */
    description?: string
    /**
     * 组件属性对象
     */
    props?: {
        children?: IPublicTypeNodeData | IPublicTypeNodeData[]
    } & IPublicTypePropsMap
    /**
     * 组件指令数组
     */
    directives?: IPublicTypeDirective[]
    /**
     * 事件
     */
    events?: IEventHandler[]
    /**
     * 渲染条件
     */
    condition?: IPublicTypeCompositeValue
    /**
     * 循环数据
     */
    loop?: IPublicTypeCompositeValue
    /**
     * 循环迭代对象、索引名称 ["item", "index"]
     */
    loopArgs?: [string, string]
    /**
     * 子节点
     */
    children?: IPublicTypeNodeData | IPublicTypeNodeData[]
    /**
     * 是否锁定
     */
    isLocked?: boolean
}

export function isNodeSchema(data: any): data is IPublicTypeNodeSchema {
    return data && data.componentName;
}
