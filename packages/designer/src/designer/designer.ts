import {
    IEditor,
    ProjectSchema,
    ComponentAction,
    ComponentMetadata,
    TransformStage,
    CompositeObject,
    PropsList,
} from '@webank/letgo-types';
import { Component } from 'vue';
import { EventEmitter } from 'events';
import { ISimulator } from '../types';
import { Project } from '../project';
import { ComponentMeta } from '../component-meta';
import { Node } from '../node';
import { Dragon } from './dragon';
import { SimulatorProps, Simulator } from '../simulator';

export interface DesignerProps {
    editor: IEditor;
    defaultSchema?: ProjectSchema;
    simulatorProps?: object | ((project: Project) => object);
    simulatorComponent?: Component;
    componentMetadatas?: ComponentMetadata[];
    // onDragstart?: (e: LocateEvent) => void;
    // onDrag?: (e: LocateEvent) => void;
    // onDragend?: (
    //     e: { dragObject: DragObject; copy: boolean },
    //     loc?: DropLocation,
    // ) => void;
    [key: string]: any;
}

export class Designer {
    private emitter = new EventEmitter();

    readonly editor: IEditor;

    readonly project: Project;

    readonly dragon = new Dragon(this);

    private _componentMetaMap = new Map<string, ComponentMeta>();

    private _lostComponentMetaMap = new Map<string, ComponentMeta>();

    private _simulator?: ISimulator;

    private _simulatorProps?:
        | SimulatorProps
        | ((designer: Designer) => SimulatorProps);

    private props?: DesignerProps;

    get currentDocument() {
        return this.project.currentDocument.value;
    }

    /**
     * 模拟器
     */
    get simulator(): ISimulator | null {
        return this._simulator || null;
    }

    get simulatorProps(): SimulatorProps & {
        designer: Designer;
        onMount?: (host: Simulator) => void;
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

    get currentSelection() {
        return this.currentDocument?.selection;
    }

    constructor(props: DesignerProps) {
        this.editor = props.editor;
        this.project = new Project(this, props.defaultSchema);
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
            return this._componentMetaMap.get(componentName)!;
        }

        if (this._lostComponentMetaMap.has(componentName)) {
            return this._lostComponentMetaMap.get(componentName)!;
        }

        const meta = new ComponentMeta(this, {
            componentName,
            ...(generateMetadata ? generateMetadata() : null),
        });

        this._lostComponentMetaMap.set(componentName, meta);

        return meta;
    }

    postEvent(event: string, ...args: any[]) {
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

    onSimulatorReady(fn: (args: any) => void): () => void {
        this.emitter.on('letgo_engine_simulator_ready', fn);
        return () => {
            this.emitter.removeListener('letgo_engine_simulator_ready', fn);
        };
    }

    setRendererReady(renderer: any) {
        this.emitter.emit('letgo_engine_renderer_ready', renderer);
    }

    onRendererReady(fn: (args: any) => void): () => void {
        this.emitter.on('letgo_engine_renderer_ready', fn);
        return () => {
            this.emitter.removeListener('letgo_engine_renderer_ready', fn);
        };
    }

    purge() {}
}

export type PropsReducerContext = { stage: TransformStage };
export type PropsReducer = (
    props: CompositeObject,
    node: Node,
    ctx?: PropsReducerContext,
) => CompositeObject;
