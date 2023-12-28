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
    ComponentMeta = IPublicModelComponentMeta,
    Selection = IPublicModelSelection,
    Simulator = IPublicModelSimulator,
> {
    readonly editor: IPublicEditor

    readonly project: IPublicModelProject

    readonly dragon: IPublicModelDragon

    readonly detecting: IPublicModelDetecting

    get componentMetaMap(): Map<string, ComponentMeta>

    get componentsMap(): { [key: string]: IPublicTypeNpmInfo | IPublicTypeComponentSchema }

    get currentDocument(): IPublicModelDocumentModel

    get currentSelection(): Selection

    get simulator(): Simulator

    get simulatorProps(): IPublicTypeSimulatorProps & {
        designer: IPublicModelDesigner
        onMount: (host: Simulator) => void
    }

    get isRendererReady(): boolean

    setProps(nextProps: IPublicTypeDesignerProps): void

    buildComponentMetaMap(metaDataList: IPublicTypeComponentMetadata[]): void

    getComponentMeta(componentName: string, generateMetadata?: () => IPublicTypeComponentMetadata | null): ComponentMeta

    onSimulatorReady(fn: (args: Simulator) => void): () => void

    setRendererReady(renderer: unknown): void

    onRendererReady(fn: (args: unknown) => void): () => void

    createSettingEntry(nodes: IPublicModelNode[]): IPublicModelSettingTop

    createOffsetObserver(nodeInstance: IPublicTypeNodeSelector): IPublicModelOffsetObserver

    touchOffsetObserver(): void
}
