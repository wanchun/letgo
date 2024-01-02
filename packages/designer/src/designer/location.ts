import {
    IPublicEnumLocationDetail,
} from '@webank/letgo-types';
import type {
    IPublicModelDropLocation,
    IPublicTypeLocateEvent,
    IPublicTypeLocationData,
    IPublicTypeLocationDetail,
    IPublicTypeRect,
} from '@webank/letgo-types';
import type { DocumentModel } from '../document';
import type { INode } from '../types';

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

export function getRectTarget(rect: IPublicTypeRect | null) {
    if (!rect || rect.computed)
        return null;

    const els = rect.elements;
    return els?.length > 0 ? els[0] : null;
}

export function isVerticalContainer(rect: IPublicTypeRect | null) {
    const el = getRectTarget(rect);
    if (!el)
        return false;

    return isRowContainer(el);
}

export function isVertical(rect: IPublicTypeRect | null) {
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

function getWindow(elem: Element | Document): Window {
    return (isDocument(elem) ? elem : elem.ownerDocument!).defaultView!;
}

export class DropLocation implements IPublicModelDropLocation<DocumentModel, INode> {
    readonly target: INode;

    readonly detail: IPublicTypeLocationDetail<INode>;

    readonly event: IPublicTypeLocateEvent<DocumentModel, INode>;

    readonly source: string;

    get document(): DocumentModel {
        return this.target.document;
    }

    constructor({ target, detail, source, event }: IPublicTypeLocationData<DocumentModel, INode>) {
        this.target = target;
        this.detail = detail;
        this.source = source;
        this.event = event;
    }

    clone(event: IPublicTypeLocateEvent<DocumentModel, INode>): DropLocation {
        return new DropLocation({
            target: this.target,
            detail: this.detail,
            source: this.source,
            event,
        });
    }
}
