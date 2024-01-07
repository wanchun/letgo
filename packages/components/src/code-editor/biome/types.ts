import type { Diagnostic } from '@biomejs/wasm-web';

export enum LoadingState {
    Loading = 0,
    Success = 1,
    Error = 2,
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
