import type {
    IPublicModelDropLocation,
    IPublicTypeLocateEvent,
} from '..';

export interface IPublicTypeSensor {
    /**
     * 是否可响应，比如面板被隐藏，可设置该值 false
     */
    readonly sensorAvailable: boolean
    /**
     * 给事件打补丁
     */
    fixEvent(e: IPublicTypeLocateEvent): IPublicTypeLocateEvent
    /**
     * 定位并激活
     */
    locate(e: IPublicTypeLocateEvent): IPublicModelDropLocation | undefined | null
    /**
     * 是否进入敏感板区域
     */
    isEnter(e: IPublicTypeLocateEvent): boolean
    /**
     * 取消激活
     */
    deActiveSensor(): void
}
