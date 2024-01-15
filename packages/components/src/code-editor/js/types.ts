import type { Diagnostic } from '@codemirror/lint';

export interface HintPathType {
    label: string
    detail: string
    type: 'function' | 'keyword' | 'variable' | 'text' | 'property'
    value?: any
}

export enum LoadingState {
    Loading = 0,
    Success = 1,
    Error = 2,
}

export interface OxcOutput {
    diagnostics: Diagnostic[]
    formatter: string
}
