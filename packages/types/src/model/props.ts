import type {
    IPublicEnumTransformStage,
    IPublicExtrasObject,
    IPublicModelNode,
    IPublicModelProp,
    IPublicTypeCompositeValue,
    IPublicTypePropsList,
    IPublicTypePropsMap,
} from '..';

export interface IBaseModelProps<
    Node = IPublicModelNode,
    Prop = IPublicModelProp,
> {

    /**
     * 所属 Node 节点
     */
    readonly owner: Node

    /**
     * 类型
     */
    get type(): 'map' | 'list'

    /**
     * 导入属性数据
     * @param value
     * @param extras
     */
    import(value?: IPublicTypePropsMap | IPublicTypePropsList | null, extras?: IPublicExtrasObject): void

    /**
     * 导出 schema
     * @param stage
     */
    export(stage: IPublicEnumTransformStage): {
        props?: IPublicTypePropsMap | IPublicTypePropsList
        extras?: IPublicExtrasObject
    }

    merge(value: IPublicTypePropsMap, extras?: IPublicTypePropsMap): void

    /**
     * 获取指定 path 的属性模型实例
     * get prop by path
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @param createIfNone 默认为true
     */
    getProp(path: string, createIfNone?: boolean): Prop | null

    /**
     * 获取指定 path 的属性模型实例
     * get prop by path
     * 注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @param createIfNone 默认为true
     */
    getExtraProp(path: string, createIfNone?: boolean): Prop | null

    /**
     * 当前 props 是否包含某 prop
     * check if the specified key is existing or not.
     * @param key
     * @since v1.1.0
     */
    has(key: string): boolean

    /**
     * 当前 props 是否包含某 extra prop
     * check if the specified key is existing or not.
     * @param key
     * @since v1.1.0
     */
    hasExtra(key: string): boolean

    /**
     * 添加一个 prop
     * add a key with given value
     * @param value
     * @param key
     * @since v1.1.0
     */
    add(key: string | number, value?: IPublicTypeCompositeValue): Prop

    /**
     * 添加一个 extra prop
     * add a key with given value
     * @param value
     * @param key
     * @since v1.1.0
     */
    addExtra(key: string | number, value?: IPublicTypeCompositeValue): Prop

    /**
     * 删除一个 Prop
     * @param prop
     */
    delete(prop: Prop): void
}

export interface IPublicModelProps extends IBaseModelProps<IPublicModelNode, IPublicModelProp> {}
