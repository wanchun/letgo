import type {
    IPublicModelScrollTarget,
    IPublicTypeAutoFit,
    IPublicTypePoint,
    IPublicTypeScrollable,
} from '..';

export interface IPublicTypeViewport extends IPublicTypeScrollable {
    /**
     * 视口大小
     */
    width: number
    height: number

    /**
     * 内容大小
     */
    contentWidth: number | IPublicTypeAutoFit
    contentHeight: number | IPublicTypeAutoFit

    /**
     * 内容缩放
     */
    scale: number

    /**
     * 视口矩形维度
     */
    readonly bounds: DOMRect
    /**
     * 内容矩形维度
     */
    readonly contentBounds: DOMRect
    /**
     * 视口滚动对象
     */
    readonly scrollTarget?: IPublicModelScrollTarget
    /**
     * 是否滚动中
     */
    readonly scrolling: boolean
    /**
     * 内容当前滚动 X
     */
    readonly scrollX: number
    /**
     * 内容当前滚动 Y
     */
    readonly scrollY: number

    /**
     * 全局坐标系转化为本地坐标系
     */
    toLocalPoint(point: IPublicTypePoint): IPublicTypePoint

    /**
     * 本地坐标系转化为全局坐标系
     */
    toGlobalPoint(point: IPublicTypePoint): IPublicTypePoint
}
