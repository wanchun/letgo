import type { ICodeItem, IPublicTypeProjectSchema } from '@webank/letgo-types';

export interface GenOptions {
    schema: IPublicTypeProjectSchema;
    letgoDir?: string;
    outDir?: string;
    basePackageJSON?: Record<string, any>;
    extraPackageJSON?: Record<string, any>;
    transformJsx?: (filesStruct: FileStruct[]) => FileStruct[];
    globalCodeCallback?: {
        afterConfig?: (params: CallBackParam) => void;
    };
    globalCssFileName?: string;
}

export interface LowCodeComponentOptions extends GenOptions {
    pkgName?: string;
    category?: string;
    group?: string;
    priority?: number;
}

export interface FileTree {
    [key: string]: string | FileTree | File;
}

export enum ImportType {
    ImportDefaultSpecifier = 'ImportDefaultSpecifier',
    ImportAll = 'ImportAll',
    ImportSpecifier = 'ImportSpecifier',
}

export interface ImportSource {
    imported?: string;
    source: string;
    type: ImportType;
    alias?: string;
    main?: string;
}

export interface SetupCode {
    importSources?: ImportSource[];
    code: string;
}

export enum PageFileType {
    Vue = 'vue',
    Jsx = 'jsx',
}

export interface FileStruct {
    rawFileName: string;
    fileType: PageFileType;
    fileName: string;
    routeName: string;
    pageTitle: string;
    afterImports: string[];
    importSources?: ImportSource[];
    codes?: string[];
    jsx: string;
}

export interface GlobalStateCode {
    fileName: string;
    content: string;
}

export interface CallBackParam {
    import: ImportSource[];
    code: string;
    export: string[];
}

export interface Context {
    codes: Map<string, ICodeItem>;
    scope: string[];
    refs?: Set<string>;
}
