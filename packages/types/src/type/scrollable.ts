import type {
    IPublicModelScrollTarget,
} from '..';

export interface IPublicTypeScrollable<
    ScrollTarget = IPublicModelScrollTarget,
> {
    scrollTarget?: ScrollTarget | Element
    bounds?: DOMRect | null
    scale?: number
}
