import type { ICodeDirectory, ICodeItem, ICodeStruct, IEnumCodeType, IEnumResourceType } from '..';

export interface IPublicModelCode {
    codeStruct: ICodeStruct;
    codeMap: Map<string, ICodeItem>;

    get directories(): ICodeStruct['directories'];

    get queries(): ICodeItem[];

    get temporaryStates(): ICodeItem[];

    get functions(): ICodeItem[];

    get code(): ICodeItem[];

    getCodeItem: (id: string) => ICodeItem;

    getDirectory: (id: string) => ICodeDirectory;

    changePosition: (id: string, referenceId: string, position: 'before' | 'inside' | 'after') => void;

    ungroundDirectory: (id: string) => void;

    changeDirectoryId: (id: string, preId: string) => void;

    deleteDirectory: (id: string) => void;

    genCodeId: (type: IEnumCodeType | 'variable') => string;

    addDirectory: (id?: string) => ICodeDirectory;

    addCodeItem: (item: ICodeItem) => void;

    addCodeItemInDirectory: (directoryId: string, typeOrCodeItem: IEnumCodeType | ICodeItem, params?: Record<string, any>) => ICodeItem;

    addCodeItemWithType: (type: IEnumCodeType, params?: Record<string, any>) => ICodeItem;

    onCodeItemAdd: (func: (codeItem: ICodeItem) => void) => () => void;

    emitCodeItemAdd: (codeItem: ICodeItem) => void;

    deleteCodeItem: (id: string) => void;

    changeCodeId: (id: string, preId: string) => void;

    emitCodeItemDelete: (id: string) => void;

    onCodeItemDelete: (func: (id: string) => void) => () => void;

    scopeVariableChange: (id: string, newVariable: string, oldVariable: string) => void;

    changeDepStateId: (newVariable: string, oldVariable: string) => void;

    changeCodeItemContent: (id: string, content: Record<string, any>) => void;

    emitCodeItemChange: (id: string, content: Record<string, any>) => void;

    onCodeItemChanged: (func: (id: string, content: Record<string, any>) => void) => () => void;
}
