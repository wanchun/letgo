import { EventEmitter } from 'eventemitter3';
import type {
    IPublicEnumTransformStage,
    IPublicTypeComponentAction,
    IPublicTypeComponentMetadata,
    IPublicTypeComponentSchema,
    IPublicTypeCompositeObject,
    IPublicTypeEditor,
    IPublicTypeNpmInfo,
    IPublicTypeProjectSchema,
    IPublicTypePropsList,
} from '@webank/letgo-types';
import {
    isNodeSchema,
} from '@webank/letgo-types';
import type { Component } from 'vue';
import type { INode, INodeSelector, ISimulator } from '../types';
import { Project } from '../project';
import { ComponentMeta } from '../component-meta';
import { insertChildren } from '../node';
import type { Simulator, ISimulatorProps } from '../simulator';
import { SettingTop } from '../setting';
import type {
    IDragObject,
    ILocateEvent,
} from './dragon';
import {
    Dragon,
    isDragNodeDataObject,
    isDragNodeObject,
} from './dragon';
import type { DropLocation } from './location';
import { isLocationChildrenDetail } from './location';
import { Detecting } from './detecting';
import type { OffsetObserver } from './offset-observer';
import { createOffsetObserver } from './offset-observer';

interface IDesignerProps {
    editor: IPublicTypeEditor
    defaultSchema?: IPublicTypeProjectSchema
    simulatorProps?: ISimulatorProps | ((designer: Designer) => ISimulatorProps)
    simulatorComponent?: Component
    componentMetadatas?: IPublicTypeComponentMetadata[]
    onDragstart?: (e: ILocateEvent) => void
    onDrag?: (e: ILocateEvent) => void
    onDragend?: (
        e: { dragObject: IDragObject; copy: boolean },
        loc?: DropLocation,
    ) => void
    [key: string]: unknown
}

interface IPropsReducerContext {
    stage: IPublicEnumTransformStage
}

type IPropsReducer = (
    props: IPublicTypeCompositeObject,
    node: INode,
    ctx?: IPropsReducerContext,
) => IPublicTypeCompositeObject;

export class Designer {
    private emitter = new EventEmitter();

    readonly editor: IPublicTypeEditor;

    readonly project: Project;

    readonly dragon: Dragon = new Dragon(this);

    readonly detecting: Detecting = new Detecting();

    private _componentMetaMap = new Map<string, ComponentMeta>();

    private _lostComponentMetaMap = new Map<string, ComponentMeta>();

    private _simulator?: ISimulator;

    private _simulatorProps?:
    | ISimulatorProps
    | ((designer: Designer) => ISimulatorProps);

    private props?: IDesignerProps;

    get componentMetaMap() {
        return this._componentMetaMap;
    }

    getCurrentDocument() {
        return this.project.currentDocument.value;
    }

    // get currentHistory() {
    //     return this.currentDocument?.history;
    // }

    getCurrentSelection() {
        return this.getCurrentDocument()?.selection;
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
    get simulatorProps(): ISimulatorProps & {
        designer: Designer
        onMount: (host: Simulator) => void
    } {
        let simulatorProps = this._simulatorProps;
        if (typeof simulatorProps === 'function')
            simulatorProps = simulatorProps(this);

        return {
            ...simulatorProps,
            designer: this,
            onMount: this.mountSimulator.bind(this),
        };
    }

    get componentsMap() {
        const maps: { [key: string]: IPublicTypeNpmInfo | IPublicTypeComponentSchema } = {};
        this._componentMetaMap.forEach((config, key) => {
            const metaData = config.getMetadata();
            if (metaData.devMode === 'lowCode')
                maps[key] = metaData.schema;

            else
                maps[key] = config.npm;
        });
        return maps;
    }

    get schema(): IPublicTypeProjectSchema {
        return this.project.getSchema();
    }

    get dropLocation() {
        return this.dragon.dropLocation;
    }

    constructor(props: IDesignerProps) {
        this.editor = props.editor;
        this.project = new Project(this, props.defaultSchema);

        this.dragon.onDragstart((e) => {
            this.detecting.enable = false;
            const { dragObject } = e;
            const currentSelection = this.getCurrentSelection();
            if (isDragNodeObject(dragObject)) {
                if (dragObject.nodes.length === 1) {
                    if (dragObject.nodes[0].parent)
                        currentSelection.select(dragObject.nodes[0].id);

                    else
                        currentSelection?.clear();
                }
            }
            else {
                currentSelection?.clear();
            }
            if (this.props?.onDragstart)
                this.props.onDragstart(e);

            this.postEvent('dragstart', e);
        });

        this.dragon.onDrag((e) => {
            if (this.props?.onDrag)
                this.props.onDrag(e);

            this.postEvent('drag', e);
        });

        this.dragon.onDragend((e) => {
            const { dragObject, copy } = e;
            const loc = this.dropLocation;
            if (loc) {
                if (
                    isLocationChildrenDetail(loc.detail)
                    && loc.detail.valid !== false
                ) {
                    let nodes: INode[] | undefined;
                    if (isDragNodeObject(dragObject)) {
                        nodes = insertChildren(
                            loc.target,
                            [...dragObject.nodes],
                            loc.detail.index,
                            copy,
                        );
                    }
                    else if (isDragNodeDataObject(dragObject)) {
                        // process nodeData
                        const nodeData = Array.isArray(dragObject.data)
                            ? dragObject.data
                            : [dragObject.data];
                        const isNotNodeSchema = nodeData.find(
                            item => !isNodeSchema(item),
                        );
                        if (isNotNodeSchema)
                            return;

                        nodes = insertChildren(
                            loc.target,
                            nodeData,
                            loc.detail.index,
                        );
                    }
                    if (nodes) {
                        loc.document.selection.selectAll(
                            nodes.map(o => o.id),
                        );
                    }
                }
            }
            if (this.props?.onDragend)
                this.props.onDragend(e, loc);

            this.detecting.enable = true;
            this.postEvent('dragend', e, loc);
        });

        this.dragon.onDropLocationChange((loc) => {
            this.postEvent('dropLocation.change', loc);
        });

        this.project.onCurrentDocumentChange(() => {
            this.postEvent(
                'current-document.change',
                this.getCurrentDocument(),
            );
            this.postEvent('selection.change', this.getCurrentSelection());
            this.setupSelection();
        });

        this.postEvent('init', this);
        this.setupSelection();
    }

    setupSelection = () => {
        let selectionDispose: undefined | (() => void);
        if (selectionDispose) {
            selectionDispose();
            selectionDispose = undefined;
        }
        const currentSelection = this.getCurrentSelection();
        this.postEvent('selection.change', currentSelection);
        if (currentSelection) {
            selectionDispose = currentSelection.onSelectionChange(() => {
                this.postEvent('selection.change', currentSelection);
            });
        }
    };

    setSchema(schema?: IPublicTypeProjectSchema) {
        this.project.load(schema);
    }

    setProps(nextProps: IDesignerProps) {
        const props = this.props ? { ...this.props, ...nextProps } : nextProps;
        if (this.props) {
            if (
                props.componentMetadatas !== this.props.componentMetadatas
                && props.componentMetadatas != null
            )
                this.buildComponentMetaMap(props.componentMetadatas);

            if (props.simulatorProps !== this.props.simulatorProps)
                this._simulatorProps = props.simulatorProps;
        }
        else {
            if (props.componentMetadatas != null)
                this.buildComponentMetaMap(props.componentMetadatas);

            if (props.simulatorProps)
                this._simulatorProps = props.simulatorProps;
        }
        this.props = props;
    }

    buildComponentMetaMap(metaDataList: IPublicTypeComponentMetadata[]) {
        metaDataList.forEach(data => this.createComponentMeta(data));
    }

    createComponentMeta(data: IPublicTypeComponentMetadata): ComponentMeta {
        const key = data.componentName;
        let meta = this._componentMetaMap.get(key);
        if (meta) {
            meta.setMetadata(data);

            this._componentMetaMap.set(key, meta);
        }
        else {
            meta = this._lostComponentMetaMap.get(key);

            if (meta) {
                meta.setMetadata(data);
                this._lostComponentMetaMap.delete(key);
            }
            else {
                meta = new ComponentMeta(this, data);
            }

            this._componentMetaMap.set(key, meta);
        }
        return meta;
    }

    getComponentMeta(
        componentName: string,
        generateMetadata?: () => IPublicTypeComponentMetadata | null,
    ): ComponentMeta {
        if (this._componentMetaMap.has(componentName))
            return this._componentMetaMap.get(componentName);

        if (this._lostComponentMetaMap.has(componentName))
            return this._lostComponentMetaMap.get(componentName);

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

    getGlobalComponentActions(): IPublicTypeComponentAction[] {
        return [];
    }

    private propsReducers = new Map<IPublicEnumTransformStage, IPropsReducer[]>();

    transformProps(
        props: IPublicTypeCompositeObject | IPublicTypePropsList,
        node: INode,
        stage: IPublicEnumTransformStage,
    ) {
        if (Array.isArray(props)) {
            // current not support, make this future
            return props;
        }

        const reducers = this.propsReducers.get(stage);
        if (!reducers)
            return props;

        return reducers.reduce((xProps, reducer) => {
            try {
                return reducer(xProps, node, {
                    stage,
                });
            }
            catch (e) {
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
        if (offsetObserver)
            this.offsetObserverList.push(offsetObserver);

        return offsetObserver;
    }

    private clearOffsetObserverList(force?: boolean) {
        let l = this.offsetObserverList.length;
        if (l > 20 || force) {
            while (l-- > 0) {
                if (this.offsetObserverList[l].isPurged())
                    this.offsetObserverList.splice(l, 1);
            }
        }
    }

    touchOffsetObserver() {
        this.clearOffsetObserverList(true);
        this.offsetObserverList.forEach(item => item.compute());
    }

    createSettingEntry(nodes: INode[]) {
        return new SettingTop(this.editor, nodes);
    }
}
