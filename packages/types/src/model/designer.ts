import type {
    IPublicEditor,
    IPublicModelComponentMeta,
    IPublicModelDetecting,
    IPublicModelDocumentModel,
    IPublicModelDragon,
    IPublicModelNode,
    IPublicModelOffsetObserver,
    IPublicModelProject,
    IPublicModelSelection,
    IPublicModelSettingTop,
    IPublicModelSimulator,
    IPublicTypeComponentMetadata,
    IPublicTypeComponentSchema,
    IPublicTypeDesignerProps,
    IPublicTypeNodeSelector,
    IPublicTypeNpmInfo,
    IPublicTypeSimulatorProps,
} from '..';

export interface IPublicModelDesigner<
    Project = IPublicModelProject,
    DocumentModel = IPublicModelDocumentModel,
    ComponentMeta = IPublicModelComponentMeta,
    Selection = IPublicModelSelection,
    Simulator = IPublicModelSimulator,
    Node = IPublicModelNode,
    Dragon = IPublicModelDragon,
    Detecting = IPublicModelDetecting,
    SettingTop = IPublicModelSettingTop,
> {
    readonly editor: IPublicEditor

    readonly project: Project

    readonly dragon: Dragon

    readonly detecting: Detecting

    get componentMetaMap(): Map<string, ComponentMeta>

    get componentsMap(): { [key: string]: IPublicTypeNpmInfo | IPublicTypeComponentSchema }

    get currentDocument(): DocumentModel

    get currentSelection(): Selection

    get simulator(): Simulator

    get simulatorProps(): IPublicTypeSimulatorProps & {
        designer: IPublicModelDesigner<Project, DocumentModel, ComponentMeta, Selection, Simulator, Node, Dragon, Detecting, SettingTop>
        onMount: (host: Simulator) => void
    }

    get isRendererReady(): boolean

    setProps(nextProps: IPublicTypeDesignerProps<DocumentModel, Node>): void

    buildComponentMetaMap(metaDataList: IPublicTypeComponentMetadata[]): void

    getComponentMeta(componentName: string, generateMetadata?: () => IPublicTypeComponentMetadata | null): ComponentMeta

    onSimulatorReady(fn: (args: Simulator) => void): () => void

    setRendererReady(renderer: unknown): void

    onRendererReady(fn: (args: unknown) => void): () => void

    createSettingEntry(nodes: Node[]): SettingTop

    createOffsetObserver(nodeInstance: IPublicTypeNodeSelector<Node>): IPublicModelOffsetObserver<Node>

    touchOffsetObserver(): void
}
