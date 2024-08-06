import type {
    IPublicModelDocumentModel,
    IPublicModelDropLocation,
    IPublicModelNode,
    IPublicTypeLocateEvent,
} from '..';

export interface IPublicTypeSensor<
    DocumentModel = IPublicModelDocumentModel,
    Node = IPublicModelNode,
> {
    /**
     * 是否可响应，比如面板被隐藏，可设置该值 false
     */
    readonly sensorAvailable: boolean;
    /**
     * 给事件打补丁
     */
    fixEvent: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => IPublicTypeLocateEvent<DocumentModel, Node>;
    /**
     * 定位并激活
     */
    locate: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => IPublicModelDropLocation<DocumentModel, Node> | undefined | null;
    /**
     * 是否进入敏感板区域
     */
    isEnter: (e: IPublicTypeLocateEvent<DocumentModel, Node>) => boolean;
    /**
     * 取消激活
     */
    deActiveSensor: () => void;
}
