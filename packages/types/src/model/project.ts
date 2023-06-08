import type {
    IPublicEnumTransformStage, IPublicModelDocumentModel,
    IPublicTypeAppConfig, IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '..';

export interface IBaseProject<
  DocumentModel,
> {
    /**
     * 【响应式】获取 schema 数据
     */
    get computedSchema(): IPublicTypeProjectSchema
    /**
     * 获取当前的 document
     * get current document
     */
    get currentDocument(): DocumentModel | null

    /**
     * 获取当前 project 下所有 documents
     * get all documents of this project
     * @returns
     */
    get documents(): DocumentModel[]

    /**
     * 获取当前 project 下所有 documentsMap
     * get all documents of this project
     * @returns
     */
    get documentsMap(): Map<string, DocumentModel>

    /**
     * 打开一个 document
     * open a document
     * @param doc
     * @returns
     */
    openDocument(doc?: string | IPublicTypeRootSchema | undefined): DocumentModel | null

    /**
     * 创建一个 document
     * create a document
     * @param data
     * @returns
     */
    createDocument(data?: IPublicTypeRootSchema): DocumentModel | null

    /**
     * 删除一个 document
     * remove a document
     * @param doc
     */
    removeDocument(doc: DocumentModel): void

    /**
     * 根据 fileName 获取 document
     * get a document by filename
     * @param fileName
     * @returns
     */
    getDocumentByFileName(fileName: string): DocumentModel | null

    /**
     * 根据 id 获取 document
     * get a document by id
     * @param id
     * @returns
     */
    getDocumentById(id: string): DocumentModel | null

    /**
     * 导出 project
     * export project to schema
     * @returns
     */
    exportSchema(stage: IPublicEnumTransformStage): IPublicTypeProjectSchema

    /**
     * 导入 project schema
     * import schema to project
     * @param schema 待导入的 project 数据
     */
    importSchema(schema?: IPublicTypeProjectSchema): void

    /**
     * 设置当前项目配置
     *
     * set config data for this project
     * @param value object
     */
    setConfig<T extends keyof IPublicTypeAppConfig>(key: T, value: IPublicTypeAppConfig[T]): void
    setConfig(value: IPublicTypeAppConfig): void
}

export interface IPublicModelProject extends IBaseProject<IPublicModelDocumentModel> {}