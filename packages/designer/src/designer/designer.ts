import { IEditor, ProjectSchema, ComponentAction } from '@webank/letgo-types';
import { Project } from '../project';

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

    // buildComponentMetasMap(metas: ComponentMetadata[]) {
    //     metas.forEach((data) => this.createComponentMeta(data));
    // }

    // createComponentMeta(data: ComponentMetadata): ComponentMeta {
    //     const key = data.componentName;
    //     let meta = this._componentMetasMap.get(key);
    //     if (meta) {
    //         meta.setMetadata(data);

    //         this._componentMetasMap.set(key, meta);
    //     } else {
    //         meta = this._lostComponentMetasMap.get(key);

    //         if (meta) {
    //             meta.setMetadata(data);
    //             this._lostComponentMetasMap.delete(key);
    //         } else {
    //             meta = new ComponentMeta(this, data);
    //         }

    //         this._componentMetasMap.set(key, meta);
    //     }
    //     return meta;
    // }

    postEvent(event: string, ...args: any[]) {
        this.editor.emit(`designer.${event}`, ...args);
    }

    getGlobalComponentActions(): ComponentAction[] {
        return [];
    }
}
