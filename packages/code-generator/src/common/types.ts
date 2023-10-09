export enum ImportType {
    ImportDefaultSpecifier = 'ImportDefaultSpecifier',
    ImportAll = 'ImportAll',
    ImportSpecifier = 'ImportSpecifier',
}

export interface ImportSource {
    imported?: string
    source: string
    type: ImportType
    alias?: string
    main?: string
}

export interface SetupCode {
    importSources?: ImportSource[]
    code: string
}

export enum PageFileType {
    Vue = 'vue',
    Jsx = 'jsx',
}

export interface FileStruct {
    fileType: PageFileType
    filename: string
    routeName: string
    pageTitle: string
    afterImports: string[]
    importSources?: ImportSource[]
    codes?: string[]
    jsx: string
}

export interface GlobalStateCode {
    filename: string
    content: string
}
