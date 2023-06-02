import type {
    IPublicEnumTransformStage, IPublicModelNode,
    IPublicTypeDisposable, IPublicTypeNodeData,
    IPublicTypeNodeSchema,
} from '..';

export interface IPublicModelNodeChildren<
  Node = IPublicModelNode,
> {
    /**
     * 返回当前 children 实例所属的节点实例
     * get owner node of this nodeChildren
     */
    get owner(): Node | null

    /**
     * children 内的节点实例数
     * get count of child nodes
     */
    get size(): number

    /**
     * 导入 schema
     * import schema
     * @param data
     */
    import(data?: IPublicTypeNodeData | IPublicTypeNodeData[]): void

    /**
     * 导出 schema
     * export schema
     * @param stage
     */
    export(stage: IPublicEnumTransformStage): IPublicTypeNodeSchema

    /**
     * 插入一个节点
     * insert a node at specific position
     * @param node 待插入节点
     * @param at 插入下标
     * @returns
     */
    insertNode(node: Node, at?: number | null): void

    /**
     * 删除指定节点
     * delete the node
     * @param node
     * @param purge
     */
    deleteChild(node: Node, purge?: boolean): boolean

    /**
     * 返回指定节点的下标
     * get index of node in current children
     * @param node
     * @returns
     */
    indexOf(node: Node): number

    /**
     * 返回指定下标的节点
     * get node with index
     * @param index
     * @returns
     */
    get(index: number): Node | null

    /**
     * 获取所有子节点
     */
    getNodes(): IPublicModelNodeChildren

    /**
    * 监听发生变化
    */
    onChange(fn: (ids: string[]) => void): IPublicTypeDisposable
}
