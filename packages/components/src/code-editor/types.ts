export interface HintPathType {
    label: string
    detail: string
    type: 'function' | 'keyword' | 'variable' | 'text' | 'property'
    value?: any
}
