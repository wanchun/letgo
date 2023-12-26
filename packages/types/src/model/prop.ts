import type {
    IPublicEnumTransformStage,
    IPublicModelNode,
    IPublicTypeCompositeValue,
} from '../';

export interface IPublicModelProp<
  Node = IPublicModelNode,
> {

    /**
     * id
     */
    get id(): string

    /**
     * key 值
     */
    key: string | number | undefined

    /**
     * 返回当前 prop 的全路径
     * get path of current prop
     */
    get path(): string[]

    /**
     * 返回所属的节点实例
     * get node instance, which this prop belongs to
     */
    get owner(): Node | null

    /**
     * 当本 prop 代表一个 Slot 时，返回对应的 slotNode
     * return the slot node (only if the current prop represents a slot)
     */
    get slotNode(): Node | undefined | null

    get value(): IPublicTypeCompositeValue

    /**
     * 设置值
     * set value for this prop
     * @param val
     */
    setValue(val: IPublicTypeCompositeValue): void

    /**
     * 获取值
     * get value of this prop
     */
    getValue(): IPublicTypeCompositeValue

    /**
     * 导出值
     * export schema
     * @param stage
     */
    export(stage: IPublicEnumTransformStage): IPublicTypeCompositeValue

    /**
     * 移除值
     * remove value of this prop
     */
    remove(): void
}
