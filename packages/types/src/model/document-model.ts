import type {
    IPublicEnumTransformStage,
    IPublicModelCode,
    IPublicModelComponentMeta,
    IPublicModelNode,
    IPublicModelProject,
    IPublicModelSelection,
    IPublicModelState,
    IPublicTypeDragNodeDataObject,
    IPublicTypeDragNodeObject,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
} from '../';

export interface IPublicModelDocumentModel<
    Project = IPublicModelProject,
    ComponentMeta = IPublicModelComponentMeta,
    Selection = IPublicModelSelection,
    Node = IPublicModelNode,
    State = IPublicModelState,
    Code = IPublicModelCode,
> {

    /**
     * id
     */
    id: string;

    readonly code: Code;

    readonly state: State;

    /**
     * 节点选中区模型实例
     * instance of selection
     */
    readonly selection: Selection;

    /**
     * 获取当前文档所属的 project
     * get project which this documentModel belongs to
     */
    readonly project: Project;

    /**
     * 获取文档的根节点
     * root node of this documentModel
     */
    get root(): Node | null;

    /**
     * 焦点选中节点
     */
    get focusNode(): Node | null;

    /**
     * 获取文档下所有节点
     * @returns
     */
    get nodesMap(): Map<string, Node>;

    get computedSchema(): IPublicTypeRootSchema;

    /**
     * 导入 schema
     * import schema data
     * @param schema
     */
    importSchema: (schema: IPublicTypeRootSchema) => void;

    /**
     * 导出 schema
     * export schema
     * @param stage
     * @returns
     */
    exportSchema: (stage: IPublicEnumTransformStage) => any;

    /**
     * 插入节点
     * insert a node
     */
    insertNode: (
        parent: Node,
        thing: Node | IPublicTypeNodeData,
        at?: number | null | undefined,
        copy?: boolean | undefined
    ) => Node | null;

    /**
     * 创建一个节点
     * create a node
     * @param data
     * @returns
     */
    createNode: <T = Node>(data: IPublicTypeNodeData) => T | null;

    /**
     * 移除指定节点/节点id
     * remove a node by node instance or nodeId
     * @param idOrNode
     */
    deleteNode: (idOrNode: string | Node) => void;

    /**
     * 移出，但是node还在
     * @param node
     */
    removeNode: (node: Node) => void;

    /**
     * 根据 nodeId 返回 Node 实例
     * get node by nodeId
     * @param nodeId
     * @returns
     */
    getNode: (nodeId: string) => Node | null;

    /**
     * 获取组件的编辑元数据
     * @param componentName
     */
    getComponentMeta: (componentName: string) => ComponentMeta;

    /**
     * componentsMap of documentModel
     * @param extraComps
     * @returns
     */
    getComponentsMap: (extraComps?: string[]) => any;

    /**
     * 检查拖拽放置的目标节点是否可以放置该拖拽对象
     * check if dragOjbect can be put in this dragTarget
     * @param dropTarget 拖拽放置的目标节点
     * @param dragObject 拖拽的对象
     * @returns boolean 是否可以放置
     */
    checkNesting: (
        dropTarget: Node,
        dragObject: IPublicTypeDragNodeObject<Node> | IPublicTypeDragNodeDataObject
    ) => boolean;

    checkDropTarget: (
        dropTarget: Node,
        dragObject: IPublicTypeDragNodeObject<Node> | IPublicTypeDragNodeDataObject,
    ) => boolean;

    /**
     * 检查对象对父级的要求，涉及配置 parentWhitelist
     */
    checkNestingUp: (parent: Node, obj: IPublicTypeNodeSchema | Node) => boolean;

    /**
     * 检查投放位置对子级的要求，涉及配置 childWhitelist
     */
    checkNestingDown: (parent: Node, obj: IPublicTypeNodeSchema | Node) => boolean;
}
