import {
    IEditor,
    ProjectSchema,
    ComponentAction,
    ComponentMetadata,
    TransformStage,
    CompositeObject,
    PropsList,
} from '@webank/letgo-types';
import { Project } from '../project';
import { ComponentMeta } from '../component-meta';
import { Node } from '../node';

export interface DesignerProps {
    editor: IEditor;
    defaultSchema?: ProjectSchema;
    className?: string;
    style?: object;
    onMount?: (designer: Designer) => void;
    onDragstart?: (e: LocateEvent) => void;
    onDrag?: (e: LocateEvent) => void;
    onDragend?: (
        e: { dragObject: DragObject; copy: boolean },
        loc?: DropLocation,
    ) => void;
    [key: string]: any;
}

export class Designer {
    readonly editor: IEditor;

    readonly project: Project;

    private _componentMetaMap = new Map<string, ComponentMeta>();

    private _lostComponentMetaMap = new Map<string, ComponentMeta>();

    get currentDocument() {
        return this.project.currentDocument;
    }

    get currentHistory() {
        return this.currentDocument?.history;
    }

    get currentSelection() {
        return this.currentDocument?.selection;
    }

    constructor(props: DesignerProps) {
        this.project = new Project(this, props.defaultSchema);
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
}

export type PropsReducerContext = { stage: TransformStage };
export type PropsReducer = (
    props: CompositeObject,
    node: Node,
    ctx?: PropsReducerContext,
) => CompositeObject;
