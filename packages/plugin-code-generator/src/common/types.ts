export enum ImportType {
    ImportDefaultSpecifier = 'ImportDefaultSpecifier',
    ImportSpecifier = 'ImportSpecifier',
}

export interface ImportSource {
    imported?: string
    source: string
    type: ImportType
    alias?: string
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
}

export interface VueFileStruct extends FileStruct {
    fileType: PageFileType.Vue
    template: string
}

export interface JsxFileStruct extends FileStruct {
    fileType: PageFileType.Jsx
    jsx: string
}

export function isVueFile(data: FileStruct): data is VueFileStruct {
    return data.fileType === PageFileType.Vue;
}

export function isJsxFile(data: FileStruct): data is JsxFileStruct {
    return data.fileType === PageFileType.Jsx;
}

export interface GlobalStateCode {
    filename: string
    content: string
}
