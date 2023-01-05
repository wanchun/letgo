import { computed, ref } from 'vue';
import { uniqueId } from '@webank/letgo-utils';
import { INodeSelector, IViewport } from '../types';
import { Node } from '../node';

export class OffsetObserver {
    readonly id = uniqueId('offsetObserver');

    private lastOffsetLeft?: number;

    private lastOffsetTop?: number;

    private lastOffsetHeight?: number;

    private lastOffsetWidth?: number;

    hasOffset = ref(false);

    private _height = ref(0);

    private _width = ref(0);

    private _left = ref(0);

    private _top = ref(0);

    private _right = ref(0);

    private _bottom = ref(0);

    height = computed(() => {
        return this.isRoot
            ? this.viewport.height
            : this._height.value * this.scale;
    });

    width = computed(() => {
        return this.isRoot
            ? this.viewport.width
            : this._width.value * this.scale;
    });

    top = computed(() => {
        return this.isRoot ? 0 : this._top.value * this.scale;
    });

    left = computed(() => {
        return this.isRoot ? 0 : this._left.value * this.scale;
    });

    bottom = computed(() => {
        return this.isRoot
            ? this.viewport.height
            : this._bottom.value * this.scale;
    });

    right = computed(() => {
        return this.isRoot
            ? this.viewport.width
            : this._right.value * this.scale;
    });

    offsetLeft = computed(() => {
        if (this.isRoot) {
            return this.viewport.scrollX * this.scale;
        }
        if (!this.viewport.scrolling || this.lastOffsetLeft == null) {
            this.lastOffsetLeft =
                this.left.value + this.viewport.scrollX * this.scale;
        }
        return this.lastOffsetLeft;
    });

    offsetTop = computed(() => {
        if (this.isRoot) {
            return this.viewport.scrollY * this.scale;
        }
        if (!this.viewport.scrolling || this.lastOffsetTop == null) {
            this.lastOffsetTop =
                this.top.value + this.viewport.scrollY * this.scale;
        }
        return this.lastOffsetTop;
    });

    offsetHeight = computed(() => {
        if (!this.viewport.scrolling || this.lastOffsetHeight == null) {
            this.lastOffsetHeight = this.isRoot
                ? this.viewport.height
                : this.height.value;
        }
        return this.lastOffsetHeight;
    });

    offsetWidth = computed(() => {
        if (!this.viewport.scrolling || this.lastOffsetWidth == null) {
            this.lastOffsetWidth = this.isRoot
                ? this.viewport.width
                : this.width.value;
        }
        return this.lastOffsetWidth;
    });

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
            this.hasOffset.value = true;
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
                this.hasOffset.value = false;
            } else if (!this.viewport.scrolling || !this.hasOffset.value) {
                this._height.value = rect.height;
                this._width.value = rect.width;
                this._left.value = rect.left;
                this._top.value = rect.top;
                this._right.value = rect.right;
                this._bottom.value = rect.bottom;
                this.hasOffset.value = true;
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
): OffsetObserver | null {
    if (!nodeInstance.instance) {
        return null;
    }
    return new OffsetObserver(nodeInstance);
}
