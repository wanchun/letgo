import { shallowReactive, ShallowReactive } from 'vue';
import { uniqueId } from '@webank/letgo-utils';
import { INodeSelector, IViewport } from '../types';
import { Node } from '../node';

export class OffsetObserver {
    readonly id = uniqueId('offsetObserver');

    private lastOffsetLeft?: number;

    private lastOffsetTop?: number;

    private lastOffsetHeight?: number;

    private lastOffsetWidth?: number;

    private _height = 0;

    private _width = 0;

    private _left = 0;

    private _top = 0;

    private _right = 0;

    private _bottom = 0;

    get height() {
        return this.isRoot ? this.viewport.height : this._height * this.scale;
    }

    get width() {
        return this.isRoot ? this.viewport.width : this._width * this.scale;
    }

    get top() {
        return this.isRoot ? 0 : this._top * this.scale;
    }

    get left() {
        return this.isRoot ? 0 : this._left * this.scale;
    }

    get bottom() {
        return this.isRoot ? this.viewport.height : this._bottom * this.scale;
    }

    get right() {
        return this.isRoot ? this.viewport.width : this._right * this.scale;
    }

    hasOffset = false;

    get offsetLeft() {
        if (this.isRoot) {
            return this.viewport.scrollX * this.scale;
        }
        if (!this.viewport.scrolling || this.lastOffsetLeft == null) {
            this.lastOffsetLeft =
                this.left + this.viewport.scrollX * this.scale;
        }
        return this.lastOffsetLeft;
    }

    get offsetTop() {
        if (this.isRoot) {
            return this.viewport.scrollY * this.scale;
        }
        if (!this.viewport.scrolling || this.lastOffsetTop == null) {
            this.lastOffsetTop = this.top + this.viewport.scrollY * this.scale;
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

    private pid: number | undefined;

    readonly viewport: IViewport;

    private isRoot: boolean;

    readonly node: Node;

    readonly compute: () => void;

    constructor(readonly nodeInstance: INodeSelector) {
        const { node, instance } = nodeInstance;
        this.node = node;
        const doc = node.document;
        const host = doc.simulator;
        const focusNode = doc.focusNode;
        this.isRoot = node.contains(focusNode);
        this.viewport = host.viewport;
        if (this.isRoot) {
            this.hasOffset = true;
            return;
        }
        if (!instance) {
            return;
        }

        let pid: number;
        const compute = () => {
            if (pid !== this.pid) {
                return;
            }

            const rect = host.computeComponentInstanceRect(
                instance,
                node.componentMeta.rootSelector,
            );

            if (!rect) {
                this.hasOffset = false;
            } else if (!this.viewport.scrolling || !this.hasOffset) {
                this._height = rect.height;
                this._width = rect.width;
                this._left = rect.left;
                this._top = rect.top;
                this._right = rect.right;
                this._bottom = rect.bottom;
                this.hasOffset = true;
            }
            this.pid = (window as any).requestIdleCallback(compute);
            pid = this.pid;
        };

        this.compute = compute;

        // try first
        compute();
        // try second, ensure the dom mounted
        this.pid = (window as any).requestIdleCallback(compute);
        pid = this.pid;
    }

    purge() {
        if (this.pid) {
            (window as any).cancelIdleCallback(this.pid);
        }
        this.pid = undefined;
    }

    isPurged() {
        return this.pid == null;
    }
}

export function createOffsetObserver(
    nodeInstance: INodeSelector,
): ShallowReactive<OffsetObserver> | null {
    if (!nodeInstance.instance) {
        return null;
    }
    return shallowReactive(new OffsetObserver(nodeInstance));
}