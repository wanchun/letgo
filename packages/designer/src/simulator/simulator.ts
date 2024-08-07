import { EventEmitter } from 'eventemitter3';
import type {
    Component,
    ShallowReactive,
    ShallowRef,
} from 'vue';
import {
    shallowReactive,
    shallowRef,
    triggerRef,
} from 'vue';
import * as Vue from 'vue';
import type {
    IPublicTypeAssetList,
    IPublicTypeCanvasPoint,
    IPublicTypeComponentRecord,
    IPublicTypeDeviceStyleProps,
    IPublicTypeDragNodeObject,
    IPublicTypeLocationChildrenDetail,
    IPublicTypePackage,
    IPublicTypeRect,
    IPublicTypeSimulatorProps,
    IPublicTypeSimulatorRenderer,
} from '@webank/letgo-types';
import {
    IPublicEnumAssetLevel,
    IPublicEnumAssetType,
    IPublicEnumDragObject,
    IPublicEnumLocationDetail,
    isDragAnyObject,
    isDragNodeObject,
    isLocationData,
} from '@webank/letgo-types';
import type {
    Logger,
} from '@webank/letgo-common';
import {
    assetBundle,
    assetItem,
    getLogger,
    hasOwnProperty,
    isElement,
    markComputed,
} from '@webank/letgo-common';
import { engineConfig } from '@webank/letgo-editor-core';
import { isNaN, isUndefined } from 'lodash-es';
import type {
    IDropContainer,
    ILocateEvent,
    INode,
    INodeInstance,
    ISimulator,
} from '../types';
import type { Project } from '../project';
import type {
    Designer,
    DropLocation,
} from '../designer';
import {
    Scroller,
    getRectTarget,
    isChildInline,
    isRowContainer,
    isShaken,
} from '../designer';
import { canMoveNode, getClosestClickableNode, getClosestNode } from '../utils';
import { contains, isRootNode } from '../node';
import type { DocumentModel } from '../document';
import { Viewport } from './viewport';
import { createSimulator } from './create-simulator';

const win = window as any;

win.Vue = Vue;

const defaultEnvironment = [
    assetItem(
        IPublicEnumAssetType.JSText,
        'window.__is_simulator_env__=true;window.__VUE_DEVTOOLS_GLOBAL_HOOK__=window.parent.__VUE_DEVTOOLS_GLOBAL_HOOK__;',
    ),
];

export class Simulator implements ISimulator<IPublicTypeSimulatorProps> {
    readonly isSimulator = true;

    private emitter = new EventEmitter();

    private _sensorAvailable = true;

    private props: ShallowReactive<IPublicTypeSimulatorProps> = shallowReactive({});

    private _contentWindow?: Window & {
        letgoRequest?: (...args: any[]) => Promise<any>;
    };

    private _contentDocument?: Document;

    private _iframe?: HTMLIFrameElement;

    private _renderer?: IPublicTypeSimulatorRenderer<INode>;

    private sensing = false;

    readonly project: Project;

    readonly logger: Logger;

    readonly designer: Designer;

    readonly viewport: Viewport = new Viewport();

    readonly scroller: Scroller;

    readonly libraryMap: { [key: string]: string } = {};

    readonly asyncLibraryMap: { [key: string]: object } = {};

    private disposes: Array<() => void> = [];

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

    get device(): string {
        return this.get('device');
    }

    get deviceClassName(): string {
        return this.get('deviceClassName');
    }

    get deviceStyle(): IPublicTypeDeviceStyleProps {
        return this.get('deviceStyle');
    }

    get designMode(): string {
        return this.get('designMode');
    }

    constructor(designer: Designer) {
        markComputed(this, ['device', 'deviceClassName', 'deviceStyle', 'designMode']);
        this.designer = designer;
        this.project = designer.project;
        this.logger = getLogger({ belong: 'simulator', outputToConsole: true });
        this.scroller = new Scroller(this.viewport);
    }

    setProps(props: IPublicTypeSimulatorProps) {
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
    connect(renderer: IPublicTypeSimulatorRenderer<INode>) {
        this._renderer = renderer;
    }

    async mountContentFrame(iframe: HTMLIFrameElement | null) {
        if (!iframe || this._iframe === iframe)
            return;

        this._iframe = iframe;
        this._contentWindow = iframe.contentWindow;
        this._contentDocument = this._contentWindow.document;

        if (this.get('letgoRequest'))
            this._contentWindow.letgoRequest = this.get('letgoRequest');

        const libraryAsset: IPublicTypeAssetList = this.buildLibrary();

        const vendors = [
            // required & use once
            assetBundle(
                this.get('environment') || defaultEnvironment,
                IPublicEnumAssetLevel.Environment,
            ),

            assetBundle(
                engineConfig.get('vueRuntimeUrl')
                ?? 'https://unpkg.com/vue/dist/vue.runtime.global.js',
                IPublicEnumAssetLevel.Environment,
            ),

            // required & use once
            assetBundle(libraryAsset, IPublicEnumAssetLevel.Library),

            // required & use once
            assetBundle(this.get('simulatorUrl'), IPublicEnumAssetLevel.Runtime),
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
    buildLibrary(library?: IPublicTypePackage[]) {
        const _library = library || (this.get('library') as IPublicTypePackage[]);
        const libraryAsset: IPublicTypeAssetList = [];
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
            assetItem(IPublicEnumAssetType.JSText, libraryExportList.join('')),
        );

        return libraryAsset;
    }

    async rerender(reloadLibrary = false) {
        if (reloadLibrary) {
            await this.setupComponents();
            this.setupUtils();
        }

        this.renderer?.rerender?.();
    }

    private async setupComponents(library?: IPublicTypePackage[]) {
        const libraryAsset: IPublicTypeAssetList = this.buildLibrary(library);
        await this.renderer?.load(libraryAsset);
        if (Object.keys(this.asyncLibraryMap).length > 0) {
            // 加载异步 Library
            await this.renderer?.loadAsyncLibrary(this.asyncLibraryMap);
            Object.keys(this.asyncLibraryMap).forEach((key) => {
                delete this.asyncLibraryMap[key];
            });
        }
        await this.renderer?.builtinComponents();
    }

    private setupUtils() {
        this.renderer.buildGlobalUtils();
    }

    setupEvents() {
        this.setupDrag();
        this.setupDetecting();
        this.setupContextMenu();
    }

    /**
     * iframe-render拖拽处理
     */
    setupDrag() {
        const { designer, project } = this;
        const doc = this.contentDocument;
        const handler = (downEvent: MouseEvent) => {
            this.postEvent('contentDocument.mousedown', downEvent);

            document.dispatchEvent(new Event('mousedown'));
            const documentModel = project.currentDocument;
            if (!documentModel)
                return;

            const { selection } = documentModel;
            let isMulti = false;
            if (this.designMode === 'design')
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

            // 插槽不让点击
            if (node.isSlot())
                return;

            downEvent.stopPropagation();
            downEvent.preventDefault();

            const isClickLeft = downEvent.button === 0;

            if (isClickLeft && !node.contains(focusNode)) {
                let nodes: INode[] = [node];
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
                        type: IPublicEnumDragObject.Node,
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
        };
        doc.addEventListener('mousedown', handler);
        this.disposes.push(() => {
            doc.removeEventListener('mousedown', handler);
        });
    }

    /**
     * iframe-render悬停处理
     */
    setupDetecting() {
        const doc = this.contentDocument;
        const { detecting, dragon } = this.designer;
        const hover = (e: MouseEvent) => {
            if (!detecting.enable || this.designMode !== 'design')
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
        const leave = () => detecting.leave(this.project.currentDocument);

        const move = (e: Event) => {
            if (dragon.dragging)
                e.stopPropagation();
        };

        doc.addEventListener('mouseover', hover, true);
        doc.addEventListener('mouseleave', leave, false);
        doc.addEventListener('mousemove', move, true);

        this.disposes.push(() => {
            doc.removeEventListener('mouseover', hover, true);
            doc.removeEventListener('mouseleave', leave, false);
            doc.removeEventListener('mousemove', move, true);
        });
    }

    setupContextMenu() {
        const doc = this.contentDocument!;
        const handleContextMenu = (e: MouseEvent) => {
            const targetElement = e.target as HTMLElement;
            const nodeInst = this.getNodeInstanceFromElement(targetElement);
            const editor = this.designer?.editor;
            if (!nodeInst) {
                editor?.emit('designer.builtinSimulator.contextmenu', {
                    originalEvent: e,
                });
                return;
            }
            const node = nodeInst.node || this.project.currentDocument?.focusNode;
            if (!node) {
                editor?.emit('designer.builtinSimulator.contextmenu', {
                    originalEvent: e,
                });
                return;
            }
            editor?.emit('designer.builtinSimulator.contextmenu', {
                node,
                originalEvent: e,
            });
        };
        doc.addEventListener('contextmenu', handleContextMenu);

        this.disposes.push(() => {
            doc.removeEventListener('contextmenu', handleContextMenu);
        });
    }

    onEvent(eventName: string, callback: (...args: any[]) => void) {
        this.emitter.on(eventName, callback);
        return () => {
            this.emitter.off(eventName, callback);
        };
    }

    postEvent(eventName: string, ...data: any[]) {
        this.emitter.emit(eventName, ...data);
    }

    /**
     * @see ISimulator
     */
    fixEvent(e: ILocateEvent): ILocateEvent {
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
    locate(e: ILocateEvent): DropLocation | null {
        const { dragObject } = e;

        const { nodes } = dragObject as unknown as IPublicTypeDragNodeObject<INode>;

        // 判断被拖动的节点是否能移动
        const operationalNodes = nodes?.filter(node => canMoveNode(node));

        if (nodes && (!operationalNodes || operationalNodes.length === 0))
            return null;

        this.sensing = true;
        this.scroller.scrolling(e);

        const document = this.project.currentDocument;
        if (!document)
            return null;

        // 根据locateEvent定位信息确定放置的节点
        const dropContainer = this.getDropContainer(e);

        // 如果放置节点父级有锁住的节点，则不能被放置
        const lockedNode = getClosestNode(
            dropContainer?.container,
            node => node.isLocked,
        );
        if (lockedNode)
            return null;

        // 如果放置节点存在白名单而且拖拽节点不在白名单，则不能被放置
        const childWhitelist
            = dropContainer?.container?.componentMeta?.childWhitelist;
        if (
            !dropContainer
            || (nodes
            && typeof childWhitelist === 'function'
            && !childWhitelist(operationalNodes[0]))
        )
            return null;

        if (isLocationData<DocumentModel, INode>(dropContainer))
            return this.designer.dragon.createLocation(dropContainer);

        const { container, instance: containerInstance } = dropContainer;

        // edge是放置节点的边缘位置信息
        const edge = this.computeComponentInstanceRect(
            containerInstance,
            container.componentMeta.rootSelector,
        );

        if (!edge)
            return null;

        if (isUndefined(e.canvasX) || isUndefined(e.canvasY))
            return null;

        const { children } = container;

        const detail: IPublicTypeLocationChildrenDetail<INode> = {
            type: IPublicEnumLocationDetail.Children,
            index: 0,
            edge,
        };

        const locationData = {
            target: container,
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

            const distance = isPointInRect({ canvasX: e.canvasX, canvasY: e.canvasY }, rect)
                ? 0
                : distanceToRect({ canvasX: e.canvasX, canvasY: e.canvasY }, rect);

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
            const row = el?.parentElement ? isRowContainer(el.parentElement) : false;
            const vertical = inline || row;

            const near: IPublicTypeLocationChildrenDetail<INode>['near'] = {
                node: nearNode,
                pos: 'before',
                align: vertical ? 'V' : 'H',
                rect: nearRect,
            };
            detail.near = near;
            if (isNearAfter({ canvasX: e.canvasX, canvasY: e.canvasY }, nearRect, vertical)) {
                near.pos = 'after';
                detail.index = nearIndex + 1;
            }
            // 暂时去掉此逻辑
            // if (!row && nearDistance !== 0) {
            //     const edgeDistance = distanceToEdge({ canvasX: e.canvasX, canvasY: e.canvasY }, edge);
            //     if (edgeDistance.distance < nearDistance!) {
            //         const { nearAfter } = edgeDistance;
            //         if (minTop == null)
            //             minTop = edge.top;

            //         if (maxBottom == null)
            //             maxBottom = edge.bottom;

            //         near.rect = new DOMRect(
            //             edge.left,
            //             minTop,
            //             edge.width,
            //             maxBottom - minTop,
            //         );
            //         near.align = 'H';
            //         near.pos = nearAfter ? 'after' : 'before';
            //         detail.index = nearAfter ? children.size : 0;
            //     }
            // }
        }

        return this.designer.dragon.createLocation(locationData);
    }

    /**
     * @see ISimulator
     */
    getDropContainer(e: ILocateEvent): IDropContainer | null {
        const { target, dragObject } = e;
        const isAny = isDragAnyObject(dragObject);

        // TODO: use spec container to accept specialData
        if (isAny) {
            // will return locationData
            return null;
        }

        const document = this.project.currentDocument;
        const { focusNode } = document;
        let container: INode;
        let nodeInstance: INodeInstance<IPublicTypeComponentRecord> | undefined;

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
        const drillDownExcludes = new Set<INode>();
        if (isDragNodeObject<INode>(dragObject)) {
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

        let dropContainer: IDropContainer = {
            container,
            instance,
        };

        let res: any;
        let upward: IDropContainer | null = null;
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
                        container: container as INode,
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
    handleAccept({ container }: IDropContainer, e: ILocateEvent): boolean {
        const { dragObject } = e;
        const document = this.project.currentDocument;
        const focusNode = document.focusNode;
        if (isRootNode(container) || container.contains(focusNode))
            return document.checkDropTarget(focusNode, dragObject as any);

        const meta = (container as INode).componentMeta;

        if (!meta.isContainer)
            return false;

        // check nesting
        return document.checkNesting(container, dragObject as any);
    }

    private instancesMapRef: ShallowRef<{
        [docId: string]: Map<string, IPublicTypeComponentRecord[]>;
    }> = shallowRef({});

    onUpdateCodesInstance(func: (codesInstance: Record<string, any>) => void) {
        this.emitter.on('updateCodesInstance', func);
        return () => {
            this.emitter.off('updateCodesInstance', func);
        };
    }

    updateCodesInstance(codesInstance: Record<string, any>) {
        this.emitter.emit('updateCodesInstance', codesInstance);
    }

    /**
     * @see ISimulator
     */
    setInstance(
        docId: string,
        id: string,
        instances: IPublicTypeComponentRecord[] | null,
    ) {
        const instancesMap = this.instancesMapRef.value;
        if (!hasOwnProperty(instancesMap, docId))
            instancesMap[docId] = new Map();

        if (instances == null)
            instancesMap[docId].delete(id);

        else
            instancesMap[docId].set(id, instances.slice());

        // 通知 component 实例变更（增、删）
        this.postEvent('componentInstanceChange', {
            docId,
            id,
            instances: instances ? instances.slice() : null,
        });

        triggerRef(this.instancesMapRef);
    }

    getComponentInstancesExpose(instance: IPublicTypeComponentRecord) {
        return this.renderer?.getNodeInstanceExpose(instance) || null;
    }

    /**
     * @see ISimulator
     */
    getComponentInstances(
        node: INode,
        context?: INodeInstance,
    ): IPublicTypeComponentRecord[] | null {
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
    computeRect(node: INode): IPublicTypeRect | null {
        const instances = this.getComponentInstances(node);
        if (!instances)
            return null;

        return this.computeComponentInstanceRect(instances[0], node.componentMeta.rootSelector);
    }

    /**
     * @see ISimulator
     */
    isEnter(e: ILocateEvent): boolean {
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
     * @see ISimulator
     */
    getComponent(componentName: string): Component | null {
        return this.renderer?.getComponent(componentName) || null;
    }

    /**
     * 通过elem寻找节点
     */
    getNodeInstanceFromElement(
        target: Element | null,
    ): INodeInstance<IPublicTypeComponentRecord> | null {
        if (!target)
            return null;

        const nodeInstance = this.getClosestNodeInstance(target);
        if (!nodeInstance)
            return null;

        const { docId } = nodeInstance;
        const doc = this.project.getDocumentById(docId);
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
        from: IPublicTypeComponentRecord | Element,
        specId?: string,
    ): INodeInstance<IPublicTypeComponentRecord> | null {
        return this.renderer?.getClosestNodeInstance(from, specId) || null;
    }

    /**
     * @see ISimulator
     */
    findDOMNodes(
        instance: IPublicTypeComponentRecord,
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
        instance: IPublicTypeComponentRecord,
        selector?: string,
    ): IPublicTypeRect | null {
        const renderer = this.renderer;
        const elements = this.findDOMNodes(instance, selector);
        if (!elements)
            return null;

        const elemArray = elements.slice();
        let rects: DOMRect[] | undefined;
        let last: { x: number; y: number; r: number; b: number } | undefined;
        let _computed = false;
        while (true) {
            if (!rects || rects.length < 1) {
                const elem = elemArray.pop();
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

    purge() {
        this._iframe = null;
        this._contentWindow = null;
        this._renderer = null;
        this.scroller.purge();
        this.viewport.purge();
        this.emitter.removeAllListeners();
        this.disposes.forEach(fn => fn());
    }
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

function isPointInRect(point: IPublicTypeCanvasPoint, rect: IPublicTypeRect) {
    return (
        point.canvasY >= rect.top
        && point.canvasY <= rect.bottom
        && point.canvasX >= rect.left
        && point.canvasX <= rect.right
    );
}

function distanceToRect(point: IPublicTypeCanvasPoint, rect: IPublicTypeRect) {
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

// function distanceToEdge(point: IPublicTypeCanvasPoint, rect: IPublicTypeRect) {
//     const distanceTop = Math.abs(point.canvasY - rect.top);
//     const distanceBottom = Math.abs(point.canvasY - rect.bottom);

//     return {
//         distance: Math.min(distanceTop, distanceBottom),
//         nearAfter: distanceBottom < distanceTop,
//     };
// }

function isNearAfter(point: IPublicTypeCanvasPoint, rect: IPublicTypeRect, inline: boolean) {
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
