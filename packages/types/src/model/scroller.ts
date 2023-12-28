import type {
    IPublicModelScrollTarget,
} from '..';

export interface IPublicModelScroller<
> {
    get scrollTarget(): IPublicModelScrollTarget | null

    scrollTo(options: { left?: number, top?: number }): void

    scrolling(point: { globalX: number, globalY: number }): void

    cancel(): void
}
