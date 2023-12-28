import type {
    IPublicModelNode,
    IPublicTypeLocateEvent,
    IPublicTypeLocationDetail,
} from '..';

export interface IPublicTypeLocationData {
    target: IPublicModelNode // shadowNode | ConditionFlow | ElementNode | IRootNode
    detail: IPublicTypeLocationDetail
    source: string
    event: IPublicTypeLocateEvent
}
