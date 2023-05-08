import { ScrollTarget } from '../designer';
import type { IPoint, IViewport, TypeAutoFit } from '../types';
import { AutoFit } from '../types';

export class Viewport implements IViewport {
    private rect?: DOMRect;

    private _bounds?: DOMRect;

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

    private viewportElement?: HTMLElement;

    mount(viewportElement: HTMLElement | null) {
        if (!viewportElement || this.viewportElement === viewportElement)
            return;

        this.viewportElement = viewportElement;
        this.touch();
    }

    touch() {
        if (this.viewportElement)
            this.rect = this.bounds;
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

    private _scale = 1;

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

    private _contentWidth: number | TypeAutoFit = AutoFit;

    private _contentHeight: number | TypeAutoFit = AutoFit;

    get contentHeight(): number | TypeAutoFit {
        return this._contentHeight;
    }

    set contentHeight(newContentHeight: number | TypeAutoFit) {
        this._contentHeight = newContentHeight;
    }

    get contentWidth(): number | TypeAutoFit {
        return this._contentWidth;
    }

    set contentWidth(val: number | TypeAutoFit) {
        this._contentWidth = val;
    }

    private _scrollX = 0;

    private _scrollY = 0;

    get scrollX() {
        return this._scrollX;
    }

    get scrollY() {
        return this._scrollY;
    }

    private _scrollTarget?: ScrollTarget;

    /**
     * 滚动对象
     */
    get scrollTarget(): ScrollTarget | undefined {
        return this._scrollTarget;
    }

    private _scrolling = false;

    get scrolling(): boolean {
        return this._scrolling;
    }

    setScrollTarget(target: Window) {
        const scrollTarget = new ScrollTarget(target);
        this._scrollX = scrollTarget.left;
        this._scrollY = scrollTarget.top;

        let scrollTimer: any;
        target.addEventListener('scroll', () => {
            this._scrollX = scrollTarget.left;
            this._scrollY = scrollTarget.top;
            this._scrolling = true;
            if (scrollTimer)
                clearTimeout(scrollTimer);

            scrollTimer = setTimeout(() => {
                this._scrolling = false;
            }, 80);
        });
        target.addEventListener('resize', () => this.touch());
        this._scrollTarget = scrollTarget;
    }

    toGlobalPoint(point: IPoint): IPoint {
        if (!this.viewportElement)
            return point;

        const rect = this.bounds;
        return {
            clientX: point.clientX * this.scale + rect.left,
            clientY: point.clientY * this.scale + rect.top,
        };
    }

    toLocalPoint(point: IPoint): IPoint {
        if (!this.viewportElement)
            return point;

        const rect = this.bounds;
        return {
            clientX: (point.clientX - rect.left) / this.scale,
            clientY: (point.clientY - rect.top) / this.scale,
        };
    }
}
