import type {
    IPublicEnumLocationDetail,
} from '..';

export interface IPublicTypeLocationPropDetail {
    // cover 形态，高亮 domNode，如果 domNode 为空，取 container 的值
    type: IPublicEnumLocationDetail.Prop
    name: string
    domNode?: HTMLElement
}
