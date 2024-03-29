import type {
    IPublicModelDocumentModel,
    IPublicModelNode,
    IPublicTypeDisposable,
} from '..';

export interface IPublicModelDetecting<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {

    /**
     * 是否启用
     * check if current detecting is enabled
     */
    enable: boolean

    /**
     * 当前 hover 的节点
     * get current hovering node
     */
    get current(): Node | null

    /**
     * hover 指定节点
     * capture node
     */
    capture(node: Node): void

    /**
     * hover 离开指定节点
     * release node
     */
    release(node: Node): void

    /**
     * 清空 hover 态
     * clear all hover state
     */
    leave(doc?: DocumentModel): void

    /**
     * hover 节点变化事件
     * set callback which will be called when hovering object changed.
     */
    onDetectingChange(fn: (node: Node | null) => void): IPublicTypeDisposable
}
