import { EventEmitter } from 'events';
import { CSSProperties, ComputedRef, computed, reactive } from 'vue';
import * as Vue from 'vue';
import {
    Package,
    Asset,
    AssetList,
    AssetType,
    AssetLevel,
} from '@webank/letgo-types';
import { assetItem, assetBundle } from '@webank/letgo-utils';
import { ISimulator, ComponentInstance, NodeInstance } from '../types';
import { Project } from '../project';
import {
    Designer,
    LocateEvent,
    Scroller,
    DropLocation,
    DragObjectType,
    isShaken,
} from '../designer';
import { getClosestClickableNode } from '../utils';
import { Node } from '../node';
import { Viewport } from './viewport';
import { ISimulatorRenderer } from './renderer';
import { createSimulator } from './create-simulator';

export interface DeviceStyleProps {
    canvas?: CSSProperties;
    viewport?: CSSProperties;
}

export interface SimulatorProps {
    designMode?: 'live' | 'design' | 'preview' | 'extend' | 'border';
    simulatorUrl?: Asset;
    device?: 'mobile' | 'iphone' | string;
    deviceClassName?: string;
    library?: Package[];
    [key: string]: any;
}

window.Vue = Vue;

const defaultEnvironment = [
    assetItem(
        AssetType.JSText,
        'window.__is_simulator_env__=true;window.__VUE_DEVTOOLS_GLOBAL_HOOK__=window.parent.__VUE_DEVTOOLS_GLOBAL_HOOK__;',
    ),
    assetItem(AssetType.JSText, 'window.Vue=parent.Vue;', undefined, 'vue'),
];

export class Simulator implements ISimulator<SimulatorProps> {
    readonly isSimulator = true;

    private emitter = new EventEmitter();

    private _sensorAvailable = true;

    private props: SimulatorProps = reactive({});

    private _contentWindow?: Window;

    private _contentDocument?: Document;

    private _iframe?: HTMLIFrameElement;

    private _renderer?: ISimulatorRenderer;

    readonly project: Project;

    readonly designer: Designer;

    readonly viewport = new Viewport();

    readonly scroller: Scroller;

    readonly libraryMap: { [key: string]: string } = {};

    readonly asyncLibraryMap: { [key: string]: object } = {};

    /**
     * 是否为画布自动渲染
     */
    autoRender = true;

    get currentDocument() {
        return this.project.currentDocument.value;
    }

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

    get designMode(): string {
        return this.get('designMode');
    }

    constructor(designer: Designer) {
        this.designer = designer;
        this.project = designer.project;
        this.scroller = new Scroller(this.viewport);
    }

    setProps(props: SimulatorProps) {
        for (const p in this.props) {
            delete this.props[p];
        }
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
        if (!iframe || this._iframe === iframe) {
            return;
        }
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
                if (item.async) {
                    this.asyncLibraryMap[item.package] = item;
                }
                if (item.exportName && item.library) {
                    libraryExportList.push(
                        `Object.defineProperty(window,'${item.exportName}',{get:()=>window.${item.library}});`,
                    );
                }
                if (item.editUrls) {
                    libraryAsset.push(item.editUrls);
                } else if (item.urls) {
                    libraryAsset.push(item.urls);
                }
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
            if (!documentModel) {
                return;
            }
            const { selection } = documentModel;
            let isMulti = false;
            if (this.designMode === 'design') {
                isMulti = downEvent.metaKey || downEvent.ctrlKey;
            } else if (!downEvent.metaKey) {
                return;
            }
            const nodeInst = this.getNodeInstanceFromElement(
                downEvent.target as Element,
            );
            const focusNode = documentModel.focusNode;
            const node = getClosestClickableNode(
                nodeInst?.node || focusNode,
                downEvent,
            );
            // 如果找不到可点击的节点, 直接返回
            if (!node) {
                return;
            }
            downEvent.stopPropagation();
            downEvent.preventDefault();

            const isClickLeft = downEvent.button === 0;

            if (isClickLeft && !node.contains(focusNode)) {
                let nodes: Node[] = [node];
                let ignoreUpSelected = false;
                if (isMulti) {
                    // multi select mode, directily add
                    if (!selection.has(node.id)) {
                        selection.add(node.id);
                        ignoreUpSelected = true;
                    }
                    selection.remove(focusNode.id);
                    // 获得顶层 nodes
                    nodes = selection.getTopNodes();
                } else if (selection.containsNode(node, true)) {
                    nodes = selection.getTopNodes();
                } else {
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
                        isMulti &&
                        !node.contains(focusNode) &&
                        selection.has(id)
                    ) {
                        selection.remove(id);
                    } else {
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
    setupDetecting() {}

    postEvent(eventName: string, ...data: any[]) {
        this.emitter.emit(eventName, ...data);
    }

    fixEvent(e: LocateEvent): LocateEvent {
        if (e.fixed) {
            return e;
        }

        const notMyEvent =
            e.originalEvent.view?.document !== this.contentDocument;
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

    locate(e: LocateEvent): DropLocation | undefined | null {
        return e;
    }

    isEnter(e: LocateEvent): boolean {
        const rect = this.viewport.bounds;
        return (
            e.globalY >= rect.top &&
            e.globalY <= rect.bottom &&
            e.globalX >= rect.left &&
            e.globalX <= rect.right
        );
    }

    private sensing = false;

    deActiveSensor(): void {
        this.sensing = false;
        this.scroller.cancel();
    }

    getNodeInstanceFromElement(
        target: Element | null,
    ): NodeInstance<ComponentInstance> | null {
        if (!target) {
            return null;
        }

        const nodeInstance = this.getClosestNodeInstance(target);
        if (!nodeInstance) {
            return null;
        }
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
        from: ComponentInstance,
        specId?: string,
    ): NodeInstance<ComponentInstance> | null {
        return this.renderer?.getClosestNodeInstance(from, specId) || null;
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
