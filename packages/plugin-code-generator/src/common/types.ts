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

export interface PageMeta {
    fileName: string
    title: string
    name: string
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
    importSources?: ImportSource[]
    codes?: string[]
}

export interface VueFileStruct extends FileStruct {
    fileType: PageFileType.Vue
    template: string
}

export function isVueFile(data: FileStruct): data is VueFileStruct {
    return data.fileType === PageFileType.Vue;
}

export interface GlobalStateCode {
    filename: string
    content: string
}
