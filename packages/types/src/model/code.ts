import type { ICodeItem, ICodeStruct, IEnumCodeType, IEnumResourceType } from '..';

export interface IPublicModelCode {
    codeStruct: ICodeStruct
    codeMap: Map<string, ICodeItem>

    get directories(): ICodeStruct['directories']

    get queries(): ICodeItem[]

    get temporaryStates(): ICodeItem[]

    get functions(): ICodeItem[]

    get code(): ICodeItem[]

    addCodeItem(item: ICodeItem): void

    addCodeItemWithType(type: IEnumCodeType, resourceType?: IEnumResourceType): void

    onCodeItemAdd(func: (codeItem: ICodeItem) => void): () => void

    emitCodeItemAdd(codeItem: ICodeItem): void

    deleteCodeItem(id: string): void

    changeCodeId(id: string, preId: string): void

    emitCodeItemDelete(id: string): void

    onCodeItemDelete(func: (id: string) => void): () => void

    scopeVariableChange(id: string, newVariable: string, oldVariable: string): void

    changeDepStateId(newVariable: string, oldVariable: string): void

    changeCodeItemContent(id: string, content: Record<string, any>): void

    emitCodeItemChange(id: string, content: Record<string, any>): void

    onCodeItemChanged(func: (id: string, content: Record<string, any>) => void): () => void
}
