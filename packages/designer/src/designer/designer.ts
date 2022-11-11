import { EventEmitter } from 'eventemitter3';
import {
    IEditor,
    ProjectSchema,
    ComponentAction,
    ComponentMetadata,
    TransformStage,
    CompositeObject,
    PropsList,
    NpmInfo,
    isNodeSchema,
    ComponentSchema,
} from '@webank/letgo-types';
import { Component, shallowReactive, ShallowReactive } from 'vue';
import { ISimulator, INodeSelector } from '../types';
import { Project } from '../project';
import { ComponentMeta } from '../component-meta';
import { Node, insertChildren } from '../node';
import { SimulatorProps, Simulator } from '../simulator';
import {
    Dragon,
    isDragNodeObject,
    isDragNodeDataObject,
    LocateEvent,
    DragObject,
} from './dragon';
import { DropLocation, isLocationChildrenDetail } from './location';
import { Detecting } from './detecting';
import { OffsetObserver, createOffsetObserver } from './offset-observer';

export interface DesignerProps {
    editor: IEditor;
    defaultSchema?: ProjectSchema;
    simulatorProps?: SimulatorProps | ((designer: Designer) => SimulatorProps);
    simulatorComponent?: Component;
    componentMetadatas?: ComponentMetadata[];
    onDragstart?: (e: LocateEvent) => void;
    onDrag?: (e: LocateEvent) => void;
    onDragend?: (
        e: { dragObject: DragObject; copy: boolean },
        loc?: DropLocation,
    ) => void;
    [key: string]: unknown;
}

export class Designer {
    private emitter = new EventEmitter();

    readonly editor: IEditor;

    readonly project: Project;

    readonly dragon: ShallowReactive<Dragon> = shallowReactive(
        new Dragon(this),
    );

    readonly detecting = new Detecting();

    private _componentMetaMap = new Map<string, ComponentMeta>();

    private _lostComponentMetaMap = new Map<string, ComponentMeta>();

    private _simulator?: ISimulator;

    private _simulatorProps?:
        | SimulatorProps
        | ((designer: Designer) => SimulatorProps);

    private props?: DesignerProps;

    get componentMetaMap() {
        return this._componentMetaMap;
    }

    get currentDocument() {
        return this.project.currentDocument.value;
    }

    // get currentHistory() {
    //     return this.currentDocument?.history;
    // }

    get currentSelection() {
        return this.currentDocument?.selection;
    }

    /**
     * 模拟器
     */
    get simulator(): ISimulator | null {
        return this._simulator || null;
    }

    /**
     * 模拟器参数
     */
    get simulatorProps(): SimulatorProps & {
        designer: Designer;
        onMount: (host: Simulator) => void;
    } {
        let simulatorProps = this._simulatorProps;
        if (typeof simulatorProps === 'function') {
            simulatorProps = simulatorProps(this);
        }
        return {
            ...simulatorProps,
            designer: this,
            onMount: this.mountSimulator.bind(this),
        };
    }

    get componentsMap() {
        const maps: { [key: string]: NpmInfo | ComponentSchema } = {};
        this._componentMetaMap.forEach((config, key) => {
            const metaData = config.getMetadata();
            if (metaData.devMode === 'lowCode') {
                maps[key] = metaData.schema;
            } else {
                maps[key] = config.npm;
            }
        });
        return maps;
    }

    get schema(): ProjectSchema {
        return this.project.getSchema();
    }

    get dropLocation() {
        return this.dragon.dropLocation;
    }

    constructor(props: DesignerProps) {
        this.editor = props.editor;
        this.project = new Project(this, props.defaultSchema);

        this.dragon.onDragstart((e) => {
            this.detecting.enable = false;
            const { dragObject } = e;
            if (isDragNodeObject(dragObject)) {
                if (dragObject.nodes.length === 1) {
                    if (dragObject.nodes[0].parent) {
                        // ensure current selecting
                        dragObject.nodes[0].select();
                    } else {
                        this.currentSelection?.clear();
                    }
                }
            } else {
                this.currentSelection?.clear();
            }
            if (this.props?.onDragstart) {
                this.props.onDragstart(e);
            }
            this.postEvent('dragstart', e);
        });

        this.dragon.onDrag((e) => {
            if (this.props?.onDrag) {
                this.props.onDrag(e);
            }
            this.postEvent('drag', e);
        });

        this.dragon.onDragend((e) => {
            const { dragObject, copy } = e;
            const loc = this.dropLocation;
            if (loc) {
                if (
                    isLocationChildrenDetail(loc.detail) &&
                    loc.detail.valid !== false
                ) {
                    let nodes: Node[] | undefined;
                    if (isDragNodeObject(dragObject)) {
                        nodes = insertChildren(
                            loc.target,
                            [...dragObject.nodes],
                            loc.detail.index,
                            copy,
                        );
                    } else if (isDragNodeDataObject(dragObject)) {
                        // process nodeData
                        const nodeData = Array.isArray(dragObject.data)
                            ? dragObject.data
                            : [dragObject.data];
                        const isNotNodeSchema = nodeData.find(
                            (item) => !isNodeSchema(item),
                        );
                        if (isNotNodeSchema) {
                            return;
                        }
                        nodes = insertChildren(
                            loc.target,
                            nodeData,
                            loc.detail.index,
                        );
                    }
                    if (nodes) {
                        loc.document.selection.selectAll(
                            nodes.map((o) => o.id),
                        );
                    }
                }
            }
            if (this.props?.onDragend) {
                this.props.onDragend(e, loc);
            }
            this.detecting.enable = true;
            this.postEvent('dragend', e, loc);
        });

        this.dragon.onDropLocationChange((loc) => {
            this.postEvent('dropLocation.change', loc);
        });

        this.project.onCurrentDocumentChange(() => {
            this.postEvent('current-document.change', this.currentDocument);
            this.setupSelection();
        });

        this.postEvent('init', this);
    }

    setupSelection = () => {
        let selectionDispose: undefined | (() => void);
        if (selectionDispose) {
            selectionDispose();
            selectionDispose = undefined;
        }
        const { currentSelection } = this;
        this.postEvent('selection.change', currentSelection);
        if (currentSelection) {
            selectionDispose = currentSelection.onSelectionChange(() => {
                this.postEvent('selection.change', currentSelection);
            });
        }
    };

    setSchema(schema?: ProjectSchema) {
        this.project.load(schema);
    }

    setProps(nextProps: DesignerProps) {
        const props = this.props ? { ...this.props, ...nextProps } : nextProps;
        if (this.props) {
            if (
                props.componentMetadatas !== this.props.componentMetadatas &&
                props.componentMetadatas != null
            ) {
                this.buildComponentMetaMap(props.componentMetadatas);
            }
            if (props.simulatorProps !== this.props.simulatorProps) {
                this._simulatorProps = props.simulatorProps;
            }
        } else {
            if (props.componentMetadatas != null) {
                this.buildComponentMetaMap(props.componentMetadatas);
            }
            if (props.simulatorProps) {
                this._simulatorProps = props.simulatorProps;
            }
        }
        this.props = props;
    }

    buildComponentMetaMap(metaDataList: ComponentMetadata[]) {
        metaDataList.forEach((data) => this.createComponentMeta(data));
    }

    createComponentMeta(data: ComponentMetadata): ComponentMeta {
        const key = data.componentName;
        let meta = this._componentMetaMap.get(key);
        if (meta) {
            meta.setMetadata(data);

            this._componentMetaMap.set(key, meta);
        } else {
            meta = this._lostComponentMetaMap.get(key);

            if (meta) {
                meta.setMetadata(data);
                this._lostComponentMetaMap.delete(key);
            } else {
                meta = new ComponentMeta(this, data);
            }

            this._componentMetaMap.set(key, meta);
        }
        return meta;
    }

    getComponentMeta(
        componentName: string,
        generateMetadata?: () => ComponentMetadata | null,
    ): ComponentMeta {
        if (this._componentMetaMap.has(componentName)) {
            return this._componentMetaMap.get(componentName);
        }

        if (this._lostComponentMetaMap.has(componentName)) {
            return this._lostComponentMetaMap.get(componentName);
        }

        const meta = new ComponentMeta(this, {
            componentName,
            ...(generateMetadata ? generateMetadata() : null),
        });

        this._lostComponentMetaMap.set(componentName, meta);

        return meta;
    }

    postEvent(event: string, ...args: unknown[]) {
        this.editor.emit(`designer.${event}`, ...args);
    }

    getGlobalComponentActions(): ComponentAction[] {
        return [];
    }

    private propsReducers = new Map<TransformStage, PropsReducer[]>();

    transformProps(
        props: CompositeObject | PropsList,
        node: Node,
        stage: TransformStage,
    ) {
        if (Array.isArray(props)) {
            // current not support, make this future
            return props;
        }

        const reducers = this.propsReducers.get(stage);
        if (!reducers) {
            return props;
        }

        return reducers.reduce((xProps, reducer) => {
            try {
                return reducer(xProps, node, {
                    stage,
                });
            } catch (e) {
                // todo: add log
                console.warn(e);
                return xProps;
            }
        }, props);
    }

    private mountSimulator(simulator: ISimulator) {
        this._simulator = simulator;
        this.editor.set('simulator', simulator);
        this.emitter.emit('letgo_engine_simulator_ready', simulator);
    }

    onSimulatorReady(fn: (args: ISimulator) => void): () => void {
        this.emitter.on('letgo_engine_simulator_ready', fn);
        return () => {
            this.emitter.off('letgo_engine_simulator_ready', fn);
        };
    }

    setRendererReady(renderer: unknown) {
        this.emitter.emit('letgo_engine_renderer_ready', renderer);
    }

    onRendererReady(fn: (args: unknown) => void): () => void {
        this.emitter.on('letgo_engine_renderer_ready', fn);
        return () => {
            this.emitter.off('letgo_engine_renderer_ready', fn);
        };
    }

    purge() {
        this._componentMetaMap.clear();
        this._lostComponentMetaMap.clear();
        this.clearOffsetObserverList(true);
    }

    private offsetObserverList: OffsetObserver[] = [];

    createOffsetObserver(nodeInstance: INodeSelector) {
        const offsetObserver = createOffsetObserver(nodeInstance);
        this.clearOffsetObserverList();
        if (offsetObserver) {
            this.offsetObserverList.push(offsetObserver);
        }
        return offsetObserver;
    }

    private clearOffsetObserverList(force?: boolean) {
        let l = this.offsetObserverList.length;
        if (l > 20 || force) {
            while (l-- > 0) {
                if (this.offsetObserverList[l].isPurged()) {
                    this.offsetObserverList.splice(l, 1);
                }
            }
        }
    }

    touchOffsetObserver() {
        this.clearOffsetObserverList(true);
        this.offsetObserverList.forEach((item) => item.compute());
    }
}

export type PropsReducerContext = { stage: TransformStage };
export type PropsReducer = (
    props: CompositeObject,
    node: Node,
    ctx?: PropsReducerContext,
) => CompositeObject;
