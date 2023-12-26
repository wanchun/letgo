import type {
    IPublicEnumTransformStage,
    IPublicModelComponentMeta,
    IPublicModelNodeChildren,
    IPublicModelProp,
    IPublicModelSettingTopEntry,
    IPublicTypeCompositeValue,
    IPublicTypeNodeSchema,
    IPublicTypePropsList,
    IPublicTypePropsMap,
} from '../';

export interface IBaseModelNode<
    Node = IPublicModelNode,
    NodeChildren = IPublicModelNodeChildren,
    ComponentMeta = IPublicModelComponentMeta,
    SettingTopEntry = IPublicModelSettingTopEntry,
    Prop = IPublicModelProp,
> {
    /**
     * 节点 id
     * node id
     */
    readonly id: string

    /**
     * 节点 ref
     */
    ref: string

    /**
     * 节点 componentName
     * componentName
     */
    readonly componentName: string

    /**
     * 节点的物料元数据
     * get component meta of this node
     */
    get componentMeta(): ComponentMeta | null

    /**
     * schema 结构
     */
    get computedSchema(): IPublicTypeNodeSchema

    /**
     * 获取对应的 setting entry
     * get setting entry of this node
     */
    get settingEntry(): SettingTopEntry

    /**
     * 获取当前节点的父亲节点
     * get parent of this node
     */
    get parent(): Node | null

    /**
     * 获取当前节点的孩子节点模型
     * get children of this node
     */
    get children(): NodeChildren | null

    /**
     * 节点所在树的层级深度，根节点深度为 0
     * depth level of this node, value of root node is 0
     */
    get zLevel(): number

    /**
     * 节点标题
     * title of node
     */
    get title(): string

    /**
     * 返回节点的属性集
     * get props data
     */
    get propsData(): IPublicTypePropsMap | IPublicTypePropsList | null

    /**
     * 下标
     * index
     */
    get index(): number

    /**
     * 获取当前节点的前一个兄弟节点
     * get previous sibling of this node
     */
    get prevSibling(): Node | null | undefined

    /**
     * 获取当前节点的后一个兄弟节点
     * get next sibling of this node
     */
    get nextSibling(): Node | null | undefined

    /**
     * 获取当前节点的锁定状态
     * check if current node is locked
     */
    get isLocked(): boolean

    /**
     * 节点上挂载的插槽节点们
     * get slots of this node
     */
    get slots(): Node[]

    /**
     * 当前节点为插槽节点时，返回节点对应的属性实例
     * return coresponding prop when this node is a slot node
     */
    get slotFor(): Prop | null | undefined

    /**
     * 获取指定 path 的属性模型实例
     * get prop by path
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @param createIfNone 如果不存在，是否新建，默认为 true
     */
    getProp(path: string | number, createIfNone?: boolean): Prop | null

    /**
     * 获取指定 path 的属性模型实例，
     *  注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
     *
     * get extra prop by path, an extra prop means a prop not exists in the `props`
     * but as siblint of the `props`
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @param createIfNone 当没有属性的时候，是否创建一个属性
     */
    getExtraProp(path: string, createIfNone?: boolean): Prop | null

    /**
     * 获取指定 path 的属性模型实例值
     * get prop value by path
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     */
    getPropValue(path: string): any

    /**
     * 设置指定 path 的属性模型实例值
     * set value for prop with path
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @param value 值
     */
    setPropValue(path: string | number, value: IPublicTypeCompositeValue): void

    /**
     * 获取指定 path 的属性模型实例，
     *  注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
     *
     * get extra prop value by path, an extra prop means a prop not exists in the `props`
     * but as siblint of the `props`
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @returns
     */
    getExtraPropValue(path: string): any

    /**
     * 设置指定 path 的属性模型实例值
     * set value for extra prop with path
     * @param path 属性路径，支持 a / a.b / a.0 等格式
     * @param value 值
     */
    setExtraPropValue(path: string, value: IPublicTypeCompositeValue): void

    /**
     * 导入节点数据
     * import node schema
     * @param data
     */
    importSchema(data: IPublicTypeNodeSchema): void

    /**
     * 导出节点数据
     * export schema from this node
     * @param stage
     * @param options
     */
    exportSchema(stage: IPublicEnumTransformStage, options?: any): IPublicTypeNodeSchema

    /**
     * 选中当前节点实例
     * select current node
     */
    select(): void

    /**
     * 设置悬停态
     * set hover value for current node
     * @param flag
     */
    hover(flag: boolean): void

    /**
     * 设置节点锁定状态
     * set lock value for current node
     * @param flag
     */
    lock(flag?: boolean): void

    /**
     * 当前节点是否包含某子节点
     * check if current node contains another node as a child
     * @param node
     */
    contains(node: Node): boolean

}

export interface IPublicModelNode extends IBaseModelNode<IPublicModelNode> {}
