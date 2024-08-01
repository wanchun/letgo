import {
    markComputed,
    markShallowReactive,
} from '@webank/letgo-common';
import { isNaN } from 'lodash-es';
import type { IPublicTypeAutoFit, IPublicTypePoint } from '@webank/letgo-types';
import { ScrollTarget } from '../designer';
import type { IViewport } from '../types';
import { AutoFit } from '../types';

export class Viewport implements IViewport {
    private rect?: DOMRect;

    private viewportElement?: HTMLElement;

    private _bounds?: DOMRect;

    private _scale = 1;

    private _contentWidth: number | IPublicTypeAutoFit = AutoFit;

    private _contentHeight: number | IPublicTypeAutoFit = AutoFit;

    private _scrollX = 0;

    private _scrollY = 0;

    private _scrollTarget?: ScrollTarget;

    private _scrolling = false;

    private dispose: Array<() => void> = [];

    get contentHeight(): number | IPublicTypeAutoFit {
        return this._contentHeight;
    }

    set contentHeight(newContentHeight: number | IPublicTypeAutoFit) {
        this._contentHeight = newContentHeight;
    }

    get contentWidth(): number | IPublicTypeAutoFit {
        return this._contentWidth;
    }

    set contentWidth(val: number | IPublicTypeAutoFit) {
        this._contentWidth = val;
    }

    /**
     * 缩放比例
     */
    get scale(): number {
        return this._scale;
    }

    set scale(newScale: number) {
        if (isNaN(newScale) || newScale <= 0)
            throw new Error(`invalid new scale "${newScale}"`);

        this._scale = newScale;
        this._contentWidth = this.width / this.scale;
        this._contentHeight = this.height / this.scale;
    }

    get height(): number {
        if (!this.rect)
            return 600;

        return this.rect.height;
    }

    set height(newHeight: number) {
        this._contentHeight = newHeight / this.scale;
        if (this.viewportElement) {
            this.viewportElement.style.height = `${newHeight}px`;
            this.touch();
        }
    }

    get width(): number {
        if (!this.rect)
            return 1000;

        return this.rect.width;
    }

    set width(newWidth: number) {
        this._contentWidth = newWidth / this.scale;
        if (this.viewportElement) {
            this.viewportElement.style.width = `${newWidth}px`;
            this.touch();
        }
    }

    get bounds(): DOMRect {
        if (this._bounds)
            return this._bounds;

        this._bounds = this.viewportElement.getBoundingClientRect();
        requestAnimationFrame(() => {
            this._bounds = undefined;
        });
        return this._bounds;
    }

    get contentBounds(): DOMRect {
        const { bounds, scale } = this;
        return new DOMRect(0, 0, bounds.width / scale, bounds.height / scale);
    }

    get scrollX() {
        return this._scrollX;
    }

    get scrollY() {
        return this._scrollY;
    }

    /**
     * 滚动对象
     */
    get scrollTarget(): ScrollTarget | undefined {
        return this._scrollTarget;
    }

    get scrolling(): boolean {
        return this._scrolling;
    }

    constructor() {
        markShallowReactive(this, {
            rect: undefined,
            _scale: 1,
            _scrollX: 0,
            _scrollY: 0,
            _contentHeight: AutoFit,
            _contentWidth: AutoFit,
        });
        markComputed(this, ['scrollX', 'scrollY']);
    }

    private touch() {
        if (this.viewportElement)
            this.rect = this.bounds;
    }

    mount(viewportElement: HTMLElement | null) {
        if (!viewportElement || this.viewportElement === viewportElement)
            return;

        this.viewportElement = viewportElement;
        this.touch();
    }

    setScrollTarget(target: Window) {
        const scrollTarget = new ScrollTarget(target);
        this._scrollX = scrollTarget.left;
        this._scrollY = scrollTarget.top;

        let scrollTimer: any;
        const handleScroll = () => {
            this._scrollX = scrollTarget.left;
            this._scrollY = scrollTarget.top;
            this._scrolling = true;
            if (scrollTimer)
                clearTimeout(scrollTimer);

            scrollTimer = setTimeout(() => {
                this._scrolling = false;
            }, 80);
        };
        target.addEventListener('scroll', handleScroll);
        const handleResize = () => this.touch();
        target.addEventListener('resize', handleResize);
        this._scrollTarget = scrollTarget;

        this.dispose.push(() => {
            target.removeEventListener('scroll', handleScroll);
            target.removeEventListener('resize', handleResize);
        });
    }

    toGlobalPoint(point: IPublicTypePoint): IPublicTypePoint {
        if (!this.viewportElement)
            return point;

        const rect = this.bounds;
        return {
            clientX: point.clientX * this.scale + rect.left,
            clientY: point.clientY * this.scale + rect.top,
        };
    }

    toLocalPoint(point: IPublicTypePoint): IPublicTypePoint {
        if (!this.viewportElement)
            return point;

        const rect = this.bounds;
        return {
            clientX: (point.clientX - rect.left) / this.scale,
            clientY: (point.clientY - rect.top) / this.scale,
        };
    }

    purge() {
        this._scrollTarget = null;
        this.dispose.forEach(fn => fn());
    }
}
