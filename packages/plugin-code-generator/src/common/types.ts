import type { IPublicTypeProjectSchema } from '@harrywan/letgo-types';

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

export interface GenCodeOptions {
    template?: Record<string, any>
    package: Record<string, any>
    globalCssFile: string
    transformFileStruct?: (filesStruct: FileStruct[]) => FileStruct[]
    transformSchema?: (schema: IPublicTypeProjectSchema) => IPublicTypeProjectSchema
    formattedCode?: (code: Record<string, any>) => Record<string, any>
}
