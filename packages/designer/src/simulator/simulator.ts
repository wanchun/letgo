import { EventEmitter } from 'events';
import { CSSProperties, ComputedRef, computed, reactive } from 'vue';
import { getPublicPath } from '@webank/letgo-editor-core';
import { Package, AssetList, AssetType, AssetLevel } from '@webank/letgo-types';
import { assetItem, assetBundle } from '@webank/letgo-utils';
import { ISimulator, ComponentInstance, NodeInstance } from '../types';
import { Project } from '../project';
import { Designer, LocateEvent, Scroller } from '../designer';
import { Viewport } from './viewport';
import { ISimulatorRenderer } from './renderer';
import { createSimulator } from './create-simulator';

export interface DeviceStyleProps {
    canvas?: CSSProperties;
    viewport?: CSSProperties;
}

export interface SimulatorProps {
    device?: 'mobile' | 'iphone' | string;
    deviceClassName?: string;
    library?: Package[];
    // utilsMetadata?: UtilsMetadata;
    [key: string]: any;
}

const defaultSimulatorUrl = (() => {
    const publicPath = getPublicPath();
    let urls;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, prefix = '', dev] = /^(.+?)(\/js)?\/?$/.exec(publicPath) || [];
    if (dev) {
        urls = [
            `${prefix}/css/vue-simulator-renderer.css`,
            `${prefix}/js/vue-simulator-renderer.js`,
        ];
    } else if (process.env.NODE_ENV === 'production') {
        urls = [
            `${prefix}/vue-simulator-renderer.css`,
            `${prefix}/vue-simulator-renderer.js`,
        ];
    } else {
        urls = [
            `${prefix}/vue-simulator-renderer.css`,
            `${prefix}/vue-simulator-renderer.js`,
        ];
    }
    return urls;
})();

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

    device: ComputedRef<string> = computed(() => {
        return this.get('device') || 'default';
    });

    deviceClassName: ComputedRef<string | undefined> = computed(() => {
        return this.get('deviceClassName');
    });

    deviceStyle: ComputedRef<DeviceStyleProps | undefined> = computed(() => {
        return this.get('deviceStyle');
    });

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
            assetBundle(
                this.get('simulatorUrl') || defaultSimulatorUrl,
                AssetLevel.Runtime,
            ),
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

    postEvent(eventName: string, ...data: any[]) {
        this.emitter.emit(eventName, ...data);
    }

    setupEvents() {}

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

    pure() {}
}
