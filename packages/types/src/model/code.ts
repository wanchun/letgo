import type { CodeItem, CodeStruct, CodeType, ResourceType } from '..';

export interface IPublicModelCode {
    codeStruct: CodeStruct
    codeMap: Map<string, CodeItem>

    get directories(): CodeStruct['directories']

    get queries(): CodeItem[]

    get temporaryStates(): CodeItem[]

    get functions(): CodeItem[]

    get code(): CodeItem[]

    addCodeItem(item: CodeItem): void

    addCodeItemWithType(type: CodeType, resourceType?: ResourceType): void

    onCodeItemAdd(func: (codeItem: CodeItem) => void): () => void

    emitCodeItemAdd(codeItem: CodeItem): void

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
