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
