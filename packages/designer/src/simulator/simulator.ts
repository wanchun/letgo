import { EventEmitter } from 'eventemitter3';
import type {
    CSSProperties,
    ComputedRef,
    ShallowReactive,
    ShallowRef,
} from 'vue';
import {
    computed,
    shallowReactive,
    shallowRef,
    triggerRef,
} from 'vue';
import * as Vue from 'vue';
import type {
    Asset,
    AssetList,
    Package,
} from '@webank/letgo-types';
import {
    AssetLevel,
    AssetType,
} from '@webank/letgo-types';
import {
    assetBundle,
    assetItem,
    hasOwnProperty,
    isElement,
} from '@webank/letgo-utils';
import { engineConfig } from '@webank/letgo-editor-core';
import type {
    DropContainer,
    ISimulator,
    InnerComponentInstance,
    NodeInstance,
    ParentalNode,
} from '../types';
import type { Project } from '../project';
import type {
    CanvasPoint,
    Designer,
    DragNodeObject,
    DropLocation,
    LocateEvent,
    LocationChildrenDetail,
    Rect,
} from '../designer';
import {
    DragObjectType,
    LocationDetailType,
    Scroller,
    getRectTarget,
    isChildInline,
    isDragAnyObject,
    isDragNodeObject,
    isLocationData,
    isRowContainer,
    isShaken,
} from '../designer';
import { getClosestClickableNode, getClosestNode } from '../utils';
import type { Node } from '../node';
import { contains, isRootNode } from '../node';
import { Viewport } from './viewport';
import type { ISimulatorRenderer } from './renderer';
import { createSimulator } from './create-simulator';

export interface DeviceStyleProps {
    canvas?: CSSProperties
    viewport?: CSSProperties
}

export interface SimulatorProps {
    designMode?: 'live' | 'design' | 'preview' | 'extend' | 'border'
    device?: 'mobile' | 'iphone' | string
    deviceStyle?: DeviceStyleProps
    deviceClassName?: string
    library?: Package[]
    simulatorUrl?: Asset
    [key: string]: any
}

const win = window as any;

win.Vue = Vue;

const defaultEnvironment = [
    assetItem(
        AssetType.JSText,
        'window.__is_simulator_env__=true;window.__VUE_DEVTOOLS_GLOBAL_HOOK__=window.parent.__VUE_DEVTOOLS_GLOBAL_HOOK__;',
    ),
];

export class Simulator implements ISimulator<SimulatorProps> {
    readonly isSimulator = true;

    private emitter = new EventEmitter();

    private _sensorAvailable = true;

    private props: ShallowReactive<SimulatorProps> = shallowReactive({});

    private _contentWindow?: Window;

    private _contentDocument?: Document;

    private _iframe?: HTMLIFrameElement;

    private _renderer?: ISimulatorRenderer;

    private sensing = false;

    readonly project: Project;

    readonly designer: Designer;

    readonly viewport: Viewport = new Viewport();

    readonly scroller: Scroller;

    readonly libraryMap: { [key: string]: string } = {};

    readonly asyncLibraryMap: { [key: string]: object } = {};

    /**
     * 是否为画布自动渲染
     */
    autoRender = true;

    get contentWindow() {
        return this._contentWindow;
    }

    get contentDocument() {
        return this._contentDocument;
    }

    get sensorAvailable(): boolean {
        return this._sensorAvailable;
    }

    get renderer() {
        return this._renderer;
    }

    get componentsMap() {
        // renderer 依赖
        return this.designer.componentsMap;
    }

    device: ComputedRef<string> = computed(() => {
        return this.get('device') || 'default';
    });

    deviceClassName: ComputedRef<string | undefined> = computed(() => {
        return this.get('deviceClassName');
    });

    deviceStyle: ComputedRef<DeviceStyleProps | undefined> = computed(() => {
        return this.get('deviceStyle');
    });

    designMode: ComputedRef<string> = computed(() => {
        return this.get('designMode');
    });

    constructor(designer: Designer) {
        this.designer = designer;
        this.project = designer.project;
        this.scroller = new Scroller(this.viewport);
    }

    setProps(props: SimulatorProps) {
        for (const p in this.props)
            delete this.props[p];

        Object.assign(this.props, props);
    }

    set(key: string, value: any) {
        Object.assign(this.props, { [key]: value });
    }

    get(key: string): any {
        return this.props[key];
    }

    mountViewport(viewport: HTMLElement | null) {
        this.viewport.mount(viewport);
    }

    /**
     * 有 Renderer 进程连接进来，设置同步机制
     */
    connect(renderer: ISimulatorRenderer) {
        this._renderer = renderer;
    }

    async mountContentFrame(iframe: HTMLIFrameElement | null) {
        if (!iframe || this._iframe === iframe)
            return;

        this._iframe = iframe;
        this._contentWindow = iframe.contentWindow;
        this._contentDocument = this._contentWindow.document;

        const libraryAsset: AssetList = this.buildLibrary();

        const vendors = [
            // required & use once
            assetBundle(
                this.get('environment') || defaultEnvironment,
                AssetLevel.Environment,
            ),

            assetBundle(
                engineConfig.get('vueRuntimeUrl')
                    ?? 'https://unpkg.com/vue/dist/vue.runtime.global.js',
                AssetLevel.Environment,
            ),

            // required & use once
            assetBundle(libraryAsset, AssetLevel.Library),

            // required & use once
            assetBundle(this.get('simulatorUrl'), AssetLevel.Runtime),
        ];

        // wait 准备 iframe 内容、依赖库注入
        const renderer = await createSimulator(this, iframe, vendors);

        if (Object.keys(this.asyncLibraryMap).length > 0) {
            // 加载异步Library
            await renderer.loadAsyncLibrary(this.asyncLibraryMap);
        }

        // ready & render
        renderer.run();

        // init events, overlays
        this.viewport.setScrollTarget(this._contentWindow);
        this.setupEvents();
    }

    /**
     * {
     *   "title":"BizCharts",
     *   "package":"bizcharts",
     *   "exportName":"bizcharts",
     *   "version":"4.0.14",
     *   "urls":[
     *      "https://g.alicdn.com/code/lib/bizcharts/4.0.14/BizCharts.js"
     *   ],
     *   "library":"BizCharts"
     * }
     * package：String 资源npm包名
     * exportName：String umd包导出名字，用于适配部分物料包define name不一致的问题，例如把BizCharts改成bizcharts，用来兼容物料用define声明的bizcharts
     * version：String 版本号
     * urls：Array 资源cdn地址，必须是umd类型，可以是.js或者.css
     * library：String umd包直接导出的name
     */
    buildLibrary(library?: Package[]) {
        const _library = library || (this.get('library') as Package[]);
        const libraryAsset: AssetList = [];
        const libraryExportList: string[] = [];

        if (_library && _library.length) {
            _library.forEach((item) => {
                this.libraryMap[item.package] = item.library;
                if (item.async)
                    this.asyncLibraryMap[item.package] = item;

                if (item.exportName && item.library) {
                    libraryExportList.push(
                        `Object.defineProperty(window,'${item.exportName}',{get:()=>window.${item.library}});`,
                    );
                }
                if (item.editUrls)
                    libraryAsset.push(item.editUrls);

                else if (item.urls)
                    libraryAsset.push(item.urls);
            });
        }
        libraryAsset.unshift(
            assetItem(AssetType.JSText, libraryExportList.join('')),
        );

        return libraryAsset;
    }

    setupEvents() {
        this.setupDrag();
        this.setupDetecting();
    }

    /**
     * iframe-render拖拽处理
     */
    setupDrag() {
        const { designer, project } = this;
        const doc = this.contentDocument;
        doc.addEventListener('mousedown', (downEvent: MouseEvent) => {
            document.dispatchEvent(new Event('mousedown'));
            const documentModel = project.currentDocument.value;
            if (!documentModel)
                return;

            const { selection } = documentModel;
            let isMulti = false;
            if (this.designMode.value === 'design')
                isMulti = downEvent.metaKey || downEvent.ctrlKey;

            else if (!downEvent.metaKey)
                return;

            const nodeInst = this.getNodeInstanceFromElement(
                downEvent.target as Element,
            );
            const focusNode = documentModel.focusNode;
            const node = getClosestClickableNode(
                nodeInst?.node || focusNode,
                downEvent,
            );
            // 如果找不到可点击的节点, 直接返回
            if (!node)
                return;

            downEvent.stopPropagation();
            downEvent.preventDefault();

            const isClickLeft = downEvent.button === 0;

            if (isClickLeft && !node.contains(focusNode)) {
                let nodes: Node[] = [node];
                let ignoreUpSelected = false;
                if (isMulti) {
                    if (!selection.has(node.id)) {
                        selection.add(node.id);
                        ignoreUpSelected = true;
                    }
                    selection.remove(focusNode.id);
                    // 获得顶层 nodes
                    nodes = selection.getTopNodes();
                }
                else if (selection.containsNode(node, true)) {
                    nodes = selection.getTopNodes();
                }
                else {
                    // will clear current selection & select dragment in dragstart
                }
                designer.dragon.boost(
                    {
                        type: DragObjectType.Node,
                        nodes,
                    },
                    downEvent,
                );
                if (ignoreUpSelected) {
                    // multi select mode has add selected, should return
                    return;
                }
            }
            const checkSelect = (e: MouseEvent) => {
                doc.removeEventListener('mouseup', checkSelect, true);
                if (!isShaken(downEvent, e)) {
                    const { id } = node;
                    if (
                        isMulti
                        && !node.contains(focusNode)
                        && selection.has(id)
                    ) {
                        selection.remove(id);
                    }
                    else {
                        selection.select(
                            node.contains(focusNode) ? focusNode.id : id,
                        );
                    }
                }
            };

            doc.addEventListener('mouseup', checkSelect, true);
        });
    }

    /**
     * iframe-render悬停处理
     */
    setupDetecting() {
        const doc = this.contentDocument;
        const { detecting, dragon } = this.designer;
        const hover = (e: MouseEvent) => {
            if (!detecting.enable || this.designMode.value !== 'design')
                return;

            const nodeInst = this.getNodeInstanceFromElement(
                e.target as Element,
            );
            if (nodeInst?.node) {
                let node = nodeInst.node;
                const focusNode = node.document?.focusNode;
                if (node.contains(focusNode))
                    node = focusNode;

                detecting.capture(node);
            }
            else {
                detecting.capture(null);
            }
            if (dragon.dragging)
                e.stopPropagation();
        };
        const leave = () => detecting.leave(this.project.currentDocument.value);

        doc.addEventListener('mouseover', hover, true);
        doc.addEventListener('mouseleave', leave, false);

        doc.addEventListener(
            'mousemove',
            (e: Event) => {
                if (dragon.dragging)
                    e.stopPropagation();
            },
            true,
        );
    }

    postEvent(eventName: string, ...data: any[]) {
        this.emitter.emit(eventName, ...data);
    }

    /**
     * @see ISimulator
     */
    fixEvent(e: LocateEvent): LocateEvent {
        if (e.fixed)
            return e;

        const notMyEvent
            = e.originalEvent.view?.document !== this.contentDocument;

        // fix canvasX canvasY : 当前激活文档画布坐标系
        if (notMyEvent || !('canvasX' in e) || !('canvasY' in e)) {
            const l = this.viewport.toLocalPoint({
                clientX: e.globalX,
                clientY: e.globalY,
            });
            e.canvasX = l.clientX;
            e.canvasY = l.clientY;
        }

        // fix target : 浏览器事件响应目标
        if (!e.target || notMyEvent) {
            if (!isNaN(e.canvasX) && !isNaN(e.canvasY)) {
                e.target = this.contentDocument?.elementFromPoint(
                    e.canvasX,
                    e.canvasY,
                );
            }
        }

        // 事件已订正
        e.fixed = true;
        return e;
    }

    /**
     * @see ISimulator
     */
    locate(e: LocateEvent): DropLocation | undefined | null {
        const { dragObject } = e;
        const { nodes } = dragObject as DragNodeObject;

        const operationalNodes = nodes?.filter((node) => {
            const onMoveHook
                = node.componentMeta?.getMetadata()?.configure.advanced?.callbacks
                    ?.onMoveHook;
            const canMove
                = (onMoveHook && typeof onMoveHook) === 'function'
                    ? onMoveHook(node)
                    : true;

            return canMove;
        });

        if (nodes && (!operationalNodes || operationalNodes.length === 0))
            return;

        this.sensing = true;
        this.scroller.scrolling(e);

        const document = this.project.currentDocument.value;
        if (!document)
            return null;

        const dropContainer = this.getDropContainer(e);

        const childWhitelist
            = dropContainer?.container?.componentMeta?.childWhitelist;
        const lockedNode = getClosestNode(
            dropContainer?.container as Node,
            node => node.isLocked,
        );
        if (lockedNode)
            return null;
        if (
            !dropContainer
            || (nodes
                && typeof childWhitelist === 'function'
                && !childWhitelist(operationalNodes[0]))
        )
            return null;

        if (isLocationData(dropContainer))
            return this.designer.dragon.createLocation(dropContainer);

        const { container, instance: containerInstance } = dropContainer;

        const edge = this.computeComponentInstanceRect(
            containerInstance,
            container.componentMeta.rootSelector,
        );

        if (!edge)
            return null;

        const { children } = container;

        const detail: LocationChildrenDetail = {
            type: LocationDetailType.Children,
            index: 0,
            edge,
        };

        const locationData = {
            target: container as ParentalNode,
            detail,
            source: `simulator${document.id}`,
            event: e,
        };

        if (!children || children.size < 1 || !edge)
            return this.designer.dragon.createLocation(locationData);

        let nearRect = null;
        let nearIndex = 0;
        let nearNode = null;
        let nearDistance = null;
        let minTop = null;
        let maxBottom = null;

        for (let i = 0, l = children.size; i < l; i++) {
            const node = children.get(i);
            const index = i;
            const instances = this.getComponentInstances(node);
            const inst = instances
                ? instances.length > 1
                    ? instances.find(
                        _inst =>
                            this.getClosestNodeInstance(_inst, container.id)
                                ?.instance === containerInstance,
                    )
                    : instances[0]
                : null;
            const rect = inst
                ? this.computeComponentInstanceRect(
                    inst,
                    node.componentMeta.rootSelector,
                )
                : null;

            if (!rect)
                continue;

            const distance = isPointInRect(e as any, rect)
                ? 0
                : distanceToRect(e as any, rect);

            if (distance === 0) {
                nearDistance = distance;
                nearNode = node;
                nearIndex = index;
                nearRect = rect;
                break;
            }

            // 标记子节点最顶
            if (minTop === null || rect.top < minTop)
                minTop = rect.top;

            // 标记子节点最底
            if (maxBottom === null || rect.bottom > maxBottom)
                maxBottom = rect.bottom;

            if (nearDistance === null || distance < nearDistance) {
                nearDistance = distance;
                nearNode = node;
                nearIndex = index;
                nearRect = rect;
            }
        }

        detail.index = nearIndex;

        if (nearNode && nearRect) {
            const el = getRectTarget(nearRect);
            const inline = el ? isChildInline(el) : false;
            const row = el ? isRowContainer(el.parentElement) : false;
            const vertical = inline || row;

            // TODO: fix type
            const near: any = {
                node: nearNode,
                pos: 'before',
                align: vertical ? 'V' : 'H',
            };
            detail.near = near;
            if (isNearAfter(e as any, nearRect, vertical)) {
                near.pos = 'after';
                detail.index = nearIndex + 1;
            }
            if (!row && nearDistance !== 0) {
                const edgeDistance = distanceToEdge(e as any, edge);
                if (edgeDistance.distance < nearDistance!) {
                    const { nearAfter } = edgeDistance;
                    if (minTop == null)
                        minTop = edge.top;

                    if (maxBottom == null)
                        maxBottom = edge.bottom;

                    near.rect = new DOMRect(
                        edge.left,
                        minTop,
                        edge.width,
                        maxBottom - minTop,
                    );
                    near.align = 'H';
                    near.pos = nearAfter ? 'after' : 'before';
                    detail.index = nearAfter ? children.size : 0;
                }
            }
        }

        return this.designer.dragon.createLocation(locationData);
    }

    /**
     * @see ISimulator
     */
    getDropContainer(e: LocateEvent): DropContainer | null {
        const { target, dragObject } = e;
        const isAny = isDragAnyObject(dragObject);

        // TODO: use spec container to accept specialData
        if (isAny) {
            // will return locationData
            return null;
        }

        const document = this.project.currentDocument.value;
        const { focusNode } = document;
        let container: Node;
        let nodeInstance: NodeInstance<InnerComponentInstance> | undefined;

        if (target) {
            const ref = this.getNodeInstanceFromElement(target);
            if (ref?.node) {
                nodeInstance = ref;
                container = ref.node;
            }
            else if (isAny) {
                return null;
            }
            else {
                container = focusNode;
            }
        }
        else {
            container = focusNode;
        }

        if (container.isLeaf())
            container = container.parent || focusNode;

        // get common parent, avoid drop container contains by dragObject
        const drillDownExcludes = new Set<Node>();
        if (isDragNodeObject(dragObject)) {
            const { nodes } = dragObject;
            let i = nodes.length;
            let p: any = container;
            while (i-- > 0) {
                if (contains(nodes[i], p))
                    p = nodes[i].parent;
            }
            if (p !== container) {
                container = p || focusNode;
                drillDownExcludes.add(container);
            }
        }

        let instance: any;
        if (nodeInstance) {
            if (nodeInstance.node === container) {
                instance = nodeInstance.instance;
            }
            else {
                instance = this.getClosestNodeInstance(
                    nodeInstance.instance as any,
                    container.id,
                )?.instance;
            }
        }
        else {
            instance = this.getComponentInstances(container)?.[0];
        }

        let dropContainer: DropContainer = {
            container: container as any,
            instance,
        };

        let res: any;
        let upward: DropContainer | null = null;
        while (container) {
            res = this.handleAccept(dropContainer, e);
            if (res === true)
                return dropContainer;

            if (!res) {
                drillDownExcludes.add(container);
                if (upward) {
                    dropContainer = upward;
                    container = dropContainer.container;
                    upward = null;
                }
                else if (container.parent) {
                    container = container.parent;
                    instance = this.getClosestNodeInstance(
                        dropContainer.instance,
                        container.id,
                    )?.instance;
                    dropContainer = {
                        container: container as ParentalNode,
                        instance,
                    };
                }
                else {
                    return null;
                }
            }
        }
        return null;
    }

    /**
     * 控制接受
     */
    handleAccept({ container }: DropContainer, e: LocateEvent): boolean {
        const { dragObject } = e;
        const document = this.project.currentDocument.value;
        const focusNode = document.focusNode;
        if (isRootNode(container) || container.contains(focusNode))
            return document.checkDropTarget(focusNode, dragObject as any);

        const meta = (container as Node).componentMeta;

        if (!meta.isContainer)
            return false;

        // check nesting
        return document.checkNesting(container, dragObject as any);
    }

    private instancesMapRef: ShallowRef<{
        [docId: string]: Map<string, InnerComponentInstance[]>
    }> = shallowRef({});

    /**
     * @see ISimulator
     */
    setInstance(
        docId: string,
        id: string,
        instances: InnerComponentInstance[] | null,
    ) {
        const instancesMap = this.instancesMapRef.value;
        if (!hasOwnProperty(instancesMap, docId))
            instancesMap[docId] = new Map();

        if (instances == null)
            instancesMap[docId].delete(id);

        else
            instancesMap[docId].set(id, instances.slice());

        triggerRef(this.instancesMapRef);
    }

    /**
     * @see ISimulator
     */
    getComponentInstances(
        node: Node,
        context?: NodeInstance,
    ): InnerComponentInstance[] | null {
        const docId = node.document.id;

        const instances
            = this.instancesMapRef.value[docId]?.get(node.id) || null;
        if (!instances || !context)
            return instances;

        // filter with context
        return instances.filter((instance) => {
            return (
                this.getClosestNodeInstance(instance, context.nodeId)
                    ?.instance === context.instance
            );
        });
    }

    /**
     * @see ISimulator
     */
    isEnter(e: LocateEvent): boolean {
        const rect = this.viewport.bounds;
        return (
            e.globalY >= rect.top
            && e.globalY <= rect.bottom
            && e.globalX >= rect.left
            && e.globalX <= rect.right
        );
    }

    /**
     * @see ISimulator
     */
    deActiveSensor(): void {
        this.sensing = false;
        this.scroller.cancel();
    }

    /**
     * 通过elem寻找节点
     */
    getNodeInstanceFromElement(
        target: Element | null,
    ): NodeInstance<InnerComponentInstance> | null {
        if (!target)
            return null;

        const nodeInstance = this.getClosestNodeInstance(target);
        if (!nodeInstance)
            return null;

        const { docId } = nodeInstance;
        const doc = this.project.findDocument(docId);
        const node = doc.getNode(nodeInstance.nodeId);
        return {
            ...nodeInstance,
            node,
        };
    }

    /**
     * @see ISimulator
     */
    getClosestNodeInstance(
        from: InnerComponentInstance,
        specId?: string,
    ): NodeInstance<InnerComponentInstance> | null {
        return this.renderer?.getClosestNodeInstance(from, specId) || null;
    }

    /**
     * @see ISimulator
     */
    findDOMNodes(
        instance: InnerComponentInstance,
        selector?: string,
    ): Array<Element | Text> | null {
        const elements = this._renderer?.findDOMNodes(instance);
        if (!elements)
            return null;

        if (selector) {
            const matched = getMatched(elements, selector);
            if (!matched)
                return null;

            return [matched];
        }
        return elements;
    }

    /**
     * @see ISimulator
     */
    computeComponentInstanceRect(
        instance: InnerComponentInstance,
        selector?: string,
    ): Rect | null {
        const renderer = this.renderer;
        let elements = this.findDOMNodes(instance, selector);
        if (!elements)
            return null;

        elements = elements.slice();
        let rects: DOMRect[] | undefined;
        let last: { x: number; y: number; r: number; b: number } | undefined;
        let _computed = false;
        while (true) {
            if (!rects || rects.length < 1) {
                const elem = elements.pop();
                if (!elem)
                    break;

                rects = renderer.getClientRects(elem);
            }
            const rect = rects.pop();
            if (!rect)
                break;

            if (rect.width === 0 && rect.height === 0)
                continue;

            if (!last) {
                last = {
                    x: rect.left,
                    y: rect.top,
                    r: rect.right,
                    b: rect.bottom,
                };
                continue;
            }
            if (rect.left < last.x) {
                last.x = rect.left;
                _computed = true;
            }
            if (rect.top < last.y) {
                last.y = rect.top;
                _computed = true;
            }
            if (rect.right > last.r) {
                last.r = rect.right;
                _computed = true;
            }
            if (rect.bottom > last.b) {
                last.b = rect.bottom;
                _computed = true;
            }
        }

        if (last) {
            const r: any = new DOMRect(
                last.x,
                last.y,
                last.r - last.x,
                last.b - last.y,
            );
            r.elements = elements;
            r.computed = _computed;
            return r;
        }

        return null;
    }

    /**
     * @see ISimulator
     */
    setDraggingState(state: boolean) {
        this.renderer?.setDraggingState(state);
    }

    /**
     * @see ISimulator
     */
    setCopyState(state: boolean) {
        this.renderer?.setCopyState(state);
    }

    /**
     * @see ISimulator
     */
    clearState() {
        this.renderer?.clearState();
    }

    pure() {}
}

function getMatched(
    elements: Array<Element | Text>,
    selector: string,
): Element | null {
    let firstQueried: Element | null = null;
    for (const elem of elements) {
        if (isElement(elem)) {
            if (elem.matches(selector))
                return elem;

            if (!firstQueried)
                firstQueried = elem.querySelector(selector);
        }
    }
    return firstQueried;
}

function isPointInRect(point: CanvasPoint, rect: Rect) {
    return (
        point.canvasY >= rect.top
        && point.canvasY <= rect.bottom
        && point.canvasX >= rect.left
        && point.canvasX <= rect.right
    );
}

function distanceToRect(point: CanvasPoint, rect: Rect) {
    let minX = Math.min(
        Math.abs(point.canvasX - rect.left),
        Math.abs(point.canvasX - rect.right),
    );
    let minY = Math.min(
        Math.abs(point.canvasY - rect.top),
        Math.abs(point.canvasY - rect.bottom),
    );
    if (point.canvasX >= rect.left && point.canvasX <= rect.right)
        minX = 0;

    if (point.canvasY >= rect.top && point.canvasY <= rect.bottom)
        minY = 0;

    return Math.sqrt(minX ** 2 + minY ** 2);
}

function distanceToEdge(point: CanvasPoint, rect: Rect) {
    const distanceTop = Math.abs(point.canvasY - rect.top);
    const distanceBottom = Math.abs(point.canvasY - rect.bottom);

    return {
        distance: Math.min(distanceTop, distanceBottom),
        nearAfter: distanceBottom < distanceTop,
    };
}

function isNearAfter(point: CanvasPoint, rect: Rect, inline: boolean) {
    if (inline) {
        return (
            Math.abs(point.canvasX - rect.left)
                + Math.abs(point.canvasY - rect.top)
            > Math.abs(point.canvasX - rect.right)
                + Math.abs(point.canvasY - rect.bottom)
        );
    }
    return (
        Math.abs(point.canvasY - rect.top)
        > Math.abs(point.canvasY - rect.bottom)
    );
}
