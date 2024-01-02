import type {
    IPublicModelDocumentModel,
    IPublicModelNode,
    IPublicTypeDragObject,
    IPublicTypeSensor,
} from '..';

export interface IPublicTypeLocateEvent<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {
    readonly type: 'LocateEvent'
    /**
     * 浏览器窗口坐标系
     */
    readonly globalX: number
    readonly globalY: number
    /**
     * 原始事件
     */
    readonly originalEvent: MouseEvent | DragEvent
    /**
     * 拖拽对象
     */
    readonly dragObject: IPublicTypeDragObject<Node>

    /**
     * 激活的感应器
     */
    sensor?: IPublicTypeSensor<DocumentModel, Node>

    // ======= 以下是 激活的 sensor 将填充的值 ========
    /**
     * 浏览器事件响应目标
     */
    target?: Element | null
    /**
     * 当前激活文档画布坐标系
     */
    canvasX?: number
    canvasY?: number
    /**
     * 激活或目标文档
     */
    document?: DocumentModel
    /**
     * 事件订正标识，初始构造时，从发起端构造，缺少 canvasX,canvasY, 需要经过订正才有
     */
    fixed?: true
}
