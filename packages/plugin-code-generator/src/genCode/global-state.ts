import type { CodeStruct, IPublicTypeProjectSchema } from '@webank/letgo-types';
import { genCode, genCodeMap, genImportCode } from './helper';
import type { SetupCode } from './types';
import { ImportType } from './types';

const TEMPLATE = `import { useSharedComposable } from '@vueuse/core';
import { reactive } from 'vue';
IMPORTS

function useLetgoGlobal() {
    const letgoContext = reactive(CONFIG);

    STATE_CODE

    return {
        letgoContext,
        CODE_KEYS
    };
}

export const useSharedLetgoGlobal = useLetgoGlobal();
`;

export const GLOBAL_STATE_FILE_NAME = 'useLetgoGlobal';

let globalStateKeys: string[];
function genGlobalStateKeys(codeStruct: CodeStruct) {
    if (!globalStateKeys) {
        const codeMap = genCodeMap(codeStruct);
        globalStateKeys = Array.from(codeMap.keys());
    }

    return globalStateKeys;
}

function getGlobalContextKey() {
    return globalStateKeys;
}

let hasGlobal: boolean;
function getGlobalFlag() {
    return hasGlobal;
}

export function genGlobalStateCode(schema: IPublicTypeProjectSchema) {
    hasGlobal = !!(schema.code || schema.config);
    if (!hasGlobal)
        return null;

    let tmp = TEMPLATE.replace('CONFIG', JSON.stringify(schema.config || {}));
    if (schema.code) {
        const { importSources, code } = genCode(schema.code);
        tmp = tmp.replace('IMPORTS', genImportCode(importSources)).replace('STATE_CODE', code).replace('CODE_KEYS', genGlobalStateKeys(schema.code).join(','));
    }
    else {
        tmp = tmp.replace('IMPORTS', '').replace('STATE_CODE', '').replace('CODE_KEYS', '');
    }

    return {
        filename: `${GLOBAL_STATE_FILE_NAME}.js`,
        content: tmp,
    };
}

export function applyGlobalState(): SetupCode {
    if (!getGlobalFlag()) {
        return {
            importSources: [],
            code: '',
        };
    }
    return {
        importSources: [{
            imported: 'useSharedLetgoGlobal',
            type: ImportType.ImportSpecifier,
            source: `@/use/${GLOBAL_STATE_FILE_NAME}`,
        }],
        code: `const {${getGlobalContextKey().concat('letgoContext').join(',')}} = useSharedLetgoGlobal()`,
    };
}
