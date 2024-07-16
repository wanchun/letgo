import { EventEmitter } from 'eventemitter3';
import type {
    IPublicEditor,
    IPublicEnumTransformStage,
    IPublicModelDesigner,
    IPublicTypeComponentAction,
    IPublicTypeComponentMetadata,
    IPublicTypeComponentSchema,
    IPublicTypeCompositeObject,
    IPublicTypeDesignerProps,
    IPublicTypeNpmInfo,
    IPublicTypeProjectSchema,
    IPublicTypePropsList,
    IPublicTypeSimulatorProps,
} from '@webank/letgo-types';
import {
    isDragNodeDataObject,
    isDragNodeObject,
    isLocationChildrenDetail,
    isNodeSchema,
} from '@webank/letgo-types';
import { markComputed } from '@webank/letgo-common';
import { isNil } from 'lodash-es';
import type { INode, INodeSelector } from '../types';
import { Project } from '../project';
import { ComponentMeta } from '../component-meta';
import { insertChildren } from '../node';
import type { Simulator } from '../simulator';
import { SettingTop } from '../setting';
import type { DocumentModel } from '../document';
import type { Selection } from '../document/selection';
import { ContextMenuActions, type IContextMenuActions } from '../context-menu';
import {
    Dragon,
} from './dragon';
import { Detecting } from './detecting';
import type { OffsetObserver } from './offset-observer';
import { createOffsetObserver } from './offset-observer';

type IDesignerProps = IPublicTypeDesignerProps<DocumentModel, INode>;

interface IPropsReducerContext {
    stage: IPublicEnumTransformStage;
}

type IPropsReducer = (
    props: IPublicTypeCompositeObject,
    node: INode,
    ctx?: IPropsReducerContext,
) => IPublicTypeCompositeObject;

export class Designer implements IPublicModelDesigner<Project, DocumentModel, ComponentMeta, Selection, Simulator, INode, Dragon, Detecting, SettingTop> {
    private emitter = new EventEmitter();

    readonly editor: IPublicEditor;

    readonly project: Project;

    readonly contextMenuActions: IContextMenuActions;

    readonly dragon: Dragon = new Dragon(this);

    readonly detecting: Detecting = new Detecting();

    private _componentMetaMap = new Map<string, ComponentMeta>();

    private _lostComponentMetaMap = new Map<string, ComponentMeta>();

    private _simulator?: Simulator;

    private _renderer: unknown;

    private _simulatorProps?:
        | IPublicTypeSimulatorProps
        | ((designer: Designer) => IPublicTypeSimulatorProps);

    private props?: IDesignerProps;

    get componentMetaMap() {
        return this._componentMetaMap;
    }

    get currentDocument() {
        return this.project.currentDocument;
    }

    get currentHistory() {
        return this.currentDocument?.history;
    }

    get currentSelection() {
        return this.currentDocument?.selection;
    }

    /**
     * 模拟器
     */
    get simulator(): Simulator | null {
        return this._simulator || null;
    }

    /**
     * 模拟器参数
     */
    get simulatorProps(): IPublicTypeSimulatorProps & {
        designer: Designer;
        onMount: (host: Simulator) => void;
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
        const maps: { [key: string]: IPublicTypeNpmInfo | IPublicTypeProjectSchema<IPublicTypeComponentSchema> } = {};
        this._componentMetaMap.forEach((config, key) => {
            const metaData = config.getMetadata();
            if (metaData.devMode === 'lowCode')
                maps[key] = metaData.schema;

            else
                maps[key] = config.npm;
        });
        return maps;
    }

    get dropLocation() {
        return this.dragon.dropLocation;
    }

    get isRendererReady() {
        return !isNil(this._renderer);
    }

    private selectionDispose: undefined | (() => void);

    private historyDispose: undefined | (() => void);

    constructor(props: IDesignerProps) {
        markComputed(this, ['computedSchema']);
        this.editor = props.editor;
        this.project = new Project(this, props.defaultSchema);

        this.dragon.onDragstart((e) => {
            this.detecting.enable = false;
            const { dragObject } = e;
            const currentSelection = this.currentSelection;
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

            this.editor.emit('designer.dragstart', e);
        });

        this.contextMenuActions = new ContextMenuActions(this);

        this.dragon.onDrag((e) => {
            if (this.props?.onDrag)
                this.props.onDrag(e);

            this.editor.emit('designer.drag', e);
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
                    if (isDragNodeObject<INode>(dragObject)) {
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
            this.editor.emit('designer.dragend', e, loc);
        });

        // TODO: 清理
        this.dragon.onDropLocationChange((loc) => {
            this.editor.emit('designer.dropLocation.change', loc);
        });

        // TODO: 清理
        this.project.onCurrentDocumentChange(() => {
            this.editor.emit(
                'designer.currentDocument.change',
                this.currentDocument,
            );
            this.setupSelection();
            this.setupHistory();
        });

        // TODO: 整理 designer 生命周期事件
        this.editor.emit('designer.init', this);
        this.setupSelection();
        this.setupHistory();
    }

    setupSelection = () => {
        if (this.selectionDispose) {
            this.selectionDispose();
            this.selectionDispose = undefined;
        }
        const currentSelection = this.currentSelection;
        this.editor.emit('designer.selection.change', currentSelection);
        if (currentSelection) {
            this.selectionDispose = currentSelection.onSelectionChange(() => {
                this.editor.emit('designer.selection.change', currentSelection);
            });
        }
    };

    setupHistory = () => {
        if (this.historyDispose) {
            this.historyDispose();
            this.historyDispose = undefined;
        }
        const currentHistory = this.currentHistory;
        this.editor.emit('designer.history.change', currentHistory);
        if (currentHistory) {
            this.historyDispose = currentHistory.onStateChange(() => {
                this.editor.emit('designer.history.change', currentHistory);
            });
        }
    };

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

    private mountSimulator(simulator: Simulator) {
        this._simulator = simulator;
        this.emitter.emit('letgo_engine_simulator_ready', simulator);
    }

    onSimulatorReady(fn: (args: Simulator) => void): () => void {
        this.emitter.on('letgo_engine_simulator_ready', fn);
        return () => {
            this.emitter.off('letgo_engine_simulator_ready', fn);
        };
    }

    setRendererReady(renderer: unknown) {
        this._renderer = renderer;
        this.emitter.emit('letgo_engine_renderer_ready', renderer);
    }

    onRendererReady(fn: (args: unknown) => void): () => void {
        this.emitter.on('letgo_engine_renderer_ready', fn);
        return () => {
            this.emitter.off('letgo_engine_renderer_ready', fn);
        };
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

    purge() {
        // 只清掉要换的部分
        this._simulator = null;
        this._renderer = null;
        this.clearOffsetObserverList(true);
    }
}
