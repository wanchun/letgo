import { markComputed, markShallowReactive, uniqueId } from '@webank/letgo-common';
import type { IPublicModelOffsetObserver } from '@webank/letgo-types';
import type { INode, INodeSelector, IViewport } from '../types';

export class OffsetObserver implements IPublicModelOffsetObserver<INode> {
    readonly id = uniqueId('offsetObserver');

    readonly node: INode;

    private lastOffsetLeft?: number;

    private lastOffsetTop?: number;

    private lastOffsetHeight?: number;

    private lastOffsetWidth?: number;

    private _hasOffset: boolean;

    private _height: number;

    private _width: number;

    private _left: number;

    private _top: number;

    private _right: number;

    private _bottom: number;

    get height() {
        return this.isRoot
            ? this.viewport.height
            : this._height * this.scale;
    }

    get width() {
        return this.isRoot
            ? this.viewport.width
            : this._width * this.scale;
    }

    get top() {
        return this.isRoot ? 0 : this._top * this.scale;
    }

    get left() {
        return this.isRoot ? 0 : this._left * this.scale;
    }

    get bottom() {
        return this.isRoot
            ? this.viewport.height
            : this._bottom * this.scale;
    }

    get right() {
        return this.isRoot
            ? this.viewport.width
            : this._right * this.scale;
    }

    get offsetLeft() {
        if (this.isRoot)
            return this.viewport.scrollX * this.scale;

        if (!this.viewport.scrolling || this.lastOffsetLeft == null) {
            this.lastOffsetLeft
                = this.left + this.viewport.scrollX * this.scale;
        }
        return this.lastOffsetLeft;
    }

    get offsetTop() {
        if (this.isRoot)
            return this.viewport.scrollY * this.scale;

        if (!this.viewport.scrolling || this.lastOffsetTop == null) {
            this.lastOffsetTop
                = this.top + this.viewport.scrollY * this.scale;
        }
        return this.lastOffsetTop;
    }

    get offsetHeight() {
        if (!this.viewport.scrolling || this.lastOffsetHeight == null) {
            this.lastOffsetHeight = this.isRoot
                ? this.viewport.height
                : this.height;
        }
        return this.lastOffsetHeight;
    }

    get offsetWidth() {
        if (!this.viewport.scrolling || this.lastOffsetWidth == null) {
            this.lastOffsetWidth = this.isRoot
                ? this.viewport.width
                : this.width;
        }
        return this.lastOffsetWidth;
    }

    get scale() {
        return this.viewport.scale;
    }

    get hasOffset() {
        return this._hasOffset;
    }

    readonly viewport: IViewport;

    private isRoot: boolean;

    private dispose: () => void;

    isPurged = false;

    constructor(nodeInstance: INodeSelector) {
        markShallowReactive(this, {
            _hasOffset: false,
            _height: 0,
            _width: 0,
            _left: 0,
            _top: 0,
            _right: 0,
            _bottom: 0,
        });

        markComputed(this, ['height', 'width', 'top', 'left', 'bottom', 'right', 'offsetLeft', 'offsetTop', 'offsetHeight', 'offsetWidth', 'scale']);

        const { node, instance } = nodeInstance;
        const doc = node.document;
        const simulator = doc.simulator;
        const focusNode = doc.focusNode;

        this.node = node;
        this.isRoot = node.contains(focusNode);
        this.viewport = simulator.viewport;
        if (this.isRoot) {
            this._hasOffset = true;
            return;
        }
        if (!instance)
            return;

        let pid: number;
        const compute = () => {
            const rect = simulator.computeComponentInstanceRect(
                instance,
                node.componentMeta.rootSelector,
            );

            if (!rect) {
                this._hasOffset = false;
            }
            else if (!this.viewport.scrolling || !this.hasOffset) {
                this._height = rect.height;
                this._width = rect.width;
                this._left = rect.left;
                this._top = rect.top;
                this._right = rect.right;
                this._bottom = rect.bottom;
                this._hasOffset = true;
            }
            pid = (window as any).requestIdleCallback(compute);
        };

        this.dispose = () => {
            if (pid)
                (window as any).cancelIdleCallback(pid);
        };

        // try first
        compute();
    }

    purge() {
        if (this.isPurged)
            return;
        this.dispose?.();
        this.isPurged = true;
    }
}

export function createOffsetObserver(
    nodeInstance: INodeSelector,
): OffsetObserver | null {
    if (!nodeInstance.instance)
        return null;

    return new OffsetObserver(nodeInstance);
}
