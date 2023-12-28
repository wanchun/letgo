import type {
} from '..';

export interface IPublicModelScrollTarget<
> {
    get left(): number

    get top(): number

    get scrollHeight(): number

    get scrollWidth(): number

    scrollTo(options: { left?: number, top?: number }): void

    scrollToXY(x: number, y: number): void
}
