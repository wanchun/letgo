import type { DocumentModel } from '../document';
import type { INode } from '../types';
import type { ILocateEvent } from './dragon';

export enum EnumLocationDetail {
    Children = 'Children',
    Prop = 'Prop',
}

export interface ILocationData {
    target: INode // shadowNode | ConditionFlow | ElementNode | IRootNode
    detail: ILocationDetail
    source: string
    event: ILocateEvent
}

export interface ILocationChildrenDetail {
    type: EnumLocationDetail.Children
    index?: number | null
    /**
     * 是否有效位置
     */
    valid?: boolean
    edge?: DOMRect
    near?: {
        node: INode
        pos: 'before' | 'after' | 'replace'
        rect?: IRect
        align?: 'V' | 'H'
    }
    focus?: { type: 'slots' } | { type: 'node'; node: INode }
}

export interface ILocationPropDetail {
    // cover 形态，高亮 domNode，如果 domNode 为空，取 container 的值
    type: EnumLocationDetail.Prop
    name: string
    domNode?: HTMLElement
}

export type ILocationDetail =
    | ILocationChildrenDetail
    | ILocationPropDetail
    | { type: string; [key: string]: any };

export interface ICanvasPoint {
    canvasX: number
    canvasY: number
}

export type IRects = DOMRect[] & {
    elements: Array<Element | Text>
};

export type IRect = DOMRect & {
    elements?: Array<Element | Text>
    computed?: boolean
};

export function isLocationData(obj: any): obj is ILocationData {
    return obj && obj.target && obj.detail;
}

export function isLocationChildrenDetail(
    obj: any,
): obj is ILocationChildrenDetail {
    return obj && obj.type === EnumLocationDetail.Children;
}

export function isRowContainer(container: Element | Text, win?: Window) {
    if (isText(container))
        return true;

    const style = (win || getWindow(container)).getComputedStyle(container);
    const display = style.getPropertyValue('display');
    if (display.endsWith('flex')) {
        const direction = style.getPropertyValue('flex-direction') || 'row';
        if (direction === 'row' || direction === 'row-reverse')
            return true;
    }
    if (display.endsWith('grid'))
        return true;

    return false;
}

export function isChildInline(child: Element | Text, win?: Window) {
    if (isText(child))
        return true;

    const style = (win || getWindow(child)).getComputedStyle(child);
    return (
        style.getPropertyValue('display').startsWith('inline')
        || /^(left|right)$/.test(style.getPropertyValue('float'))
    );
}

export function getRectTarget(rect: IRect | null) {
    if (!rect || rect.computed)
        return null;

    const els = rect.elements;
    return els?.length > 0 ? els[0] : null;
}

export function isVerticalContainer(rect: IRect | null) {
    const el = getRectTarget(rect);
    if (!el)
        return false;

    return isRowContainer(el);
}

export function isVertical(rect: IRect | null) {
    const el = getRectTarget(rect);
    if (!el)
        return false;

    return (
        isChildInline(el)
        || (el.parentElement ? isRowContainer(el.parentElement) : false)
    );
}

function isText(elem: any): elem is Text {
    return elem.nodeType === Node.TEXT_NODE;
}

function isDocument(elem: any): elem is Document {
    return elem.nodeType === Node.DOCUMENT_NODE;
}

export function getWindow(elem: Element | Document): Window {
    return (isDocument(elem) ? elem : elem.ownerDocument!).defaultView!;
}

export class DropLocation {
    readonly target: INode;

    readonly detail: ILocationDetail;

    readonly event: ILocateEvent;

    readonly source: string;

    get document(): DocumentModel {
        return this.target.document;
    }

    constructor({ target, detail, source, event }: ILocationData) {
        this.target = target;
        this.detail = detail;
        this.source = source;
        this.event = event;
    }

    clone(event: ILocateEvent): DropLocation {
        return new DropLocation({
            target: this.target,
            detail: this.detail,
            source: this.source,
            event,
        });
    }
}
