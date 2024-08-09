import type {
    IPublicModelNode,
} from '..';

export interface IPublicModelOffsetObserver<
    Node = IPublicModelNode,
> {
    readonly id: string;

    readonly node: Node;

    get hasOffset(): boolean;

    get height(): number;

    get width(): number;

    get top(): number;

    get left(): number;

    get bottom(): number;

    get right(): number;

    get offsetLeft(): number;

    get offsetTop(): number;

    get offsetHeight(): number;

    get offsetWidth(): number;

    get scale(): number;

}
