import { isNil, isObject } from 'lodash-es';
import type { ComponentInternalInstance, VNode } from 'vue';
import { isProxy } from 'vue';
import type { IPublicTypeComponentInstance, IPublicTypeComponentRecord } from '@webank/letgo-types';

const SYMBOL_VDID = Symbol('_LCDocId');
const SYMBOL_VNID = Symbol('_LCNodeId');
const SYMBOL_VInstance = Symbol('_LCVueInstance');
const SYMBOL_RECORD_FLAG = Symbol('_LCVueCompRecord');

export interface VNodeHTMLElement extends HTMLElement {
    __vnode: VNode;
    __vueParentComponent: ComponentInternalInstance;
}

export interface CompRootHTMLElement extends HTMLElement {
    [SYMBOL_VDID]: string;
    [SYMBOL_VNID]: string;
    [SYMBOL_VInstance]: IPublicTypeComponentInstance;
}

export interface CompRootData {
    docId: string;
    nodeId: string;
    instance: IPublicTypeComponentInstance;
}

export class ComponentRecord implements IPublicTypeComponentRecord {
    [SYMBOL_RECORD_FLAG] = true;
    /**
     * document id
     */
    public did: string;
    /**
     * node id
     */
    public nid: string;
    /**
     * component id
     */
    public cid: number;
    constructor(did: string, nid: string, cid: number) {
        this.did = did;
        this.nid = nid;
        this.cid = cid;
    }
}

export function isVNodeHTMLElement(el: unknown): el is VNodeHTMLElement {
    return (
        isObject(el)
        && '__vueParentComponent' in el
        && !isNil(el.__vueParentComponent)
    );
}

export function getVueInstance(instanceOrEl: IPublicTypeComponentInstance | HTMLElement) {
    let instance;
    if ('$' in instanceOrEl)
        instance = instanceOrEl;

    else if (isVNodeHTMLElement(instanceOrEl))
        instance = instanceOrEl.__vueParentComponent.proxy!;

    return instance;
}

export function isCompRootHTMLElement(
    el: Element | null | undefined,
): el is CompRootHTMLElement {
    return isObject(el) && SYMBOL_VDID in el;
}

export function isComponentRecord(el: unknown): el is ComponentRecord {
    return isObject(el) && SYMBOL_RECORD_FLAG in el;
}

export function isInternalInstance(el: unknown) {
    return isObject(el) && isProxy((el as ComponentInternalInstance).proxy);
}

export function getCompRootData(el: CompRootHTMLElement): CompRootData {
    return {
        docId: el[SYMBOL_VDID],
        nodeId: el[SYMBOL_VNID],
        instance: el[SYMBOL_VInstance],
    };
}

export function setCompRootData(
    el: CompRootHTMLElement,
    data: CompRootData,
): void {
    el[SYMBOL_VDID] = data.docId;
    el[SYMBOL_VNID] = data.nodeId;
    el[SYMBOL_VInstance] = data.instance;
}
