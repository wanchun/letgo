import { IEditor, ProjectSchema } from '@webank/letgo-types';
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

    postEvent(event: string, ...args: any[]) {
        this.editor.emit(`designer.${event}`, ...args);
    }
}
