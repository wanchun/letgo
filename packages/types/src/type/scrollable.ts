import type {
    IPublicModelScrollTarget,
} from '..';

export interface IPublicTypeScrollable {
    scrollTarget?: IPublicModelScrollTarget | Element
    bounds?: DOMRect | null
    scale?: number
}
