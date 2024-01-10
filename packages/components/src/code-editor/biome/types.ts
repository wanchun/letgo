import type { Diagnostic } from '@biomejs/wasm-web';
import type { Extension } from '@codemirror/state';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';

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

export interface CodeEditorProps {
    doc: string
    scopeVariables?: Record<string, any>
    compRef?: string
    documentModel?: IPublicModelDocumentModel
    height?: string
    language?: 'json' | 'javascript'
    theme?: Record<string, any>
    extensions?: Extension[]
    onChange?: (doc: string) => void
    onFocus?: (doc: string) => void
    onBlur?: (doc: string) => void
}

export interface BiomeOutput {
    diagnostics: {
        console: string
        list: Diagnostic[]
    }
    formatter: {
        code: string
        ir: string
    }
}

export const emptyBiomeOutput: BiomeOutput = {
    diagnostics: {
        console: '',
        list: [],
    },
    formatter: {
        code: '',
        ir: '',
    },
};
