import type { CodeStruct, IPublicTypeNpmInfo, IPublicTypeProjectSchema, IPublicTypeUtilsMap } from '@harrywan/letgo-types';
import { genCode, genCodeMap, genImportCode } from './helper';
import type { ImportSource, SetupCode } from './types';
import { ImportType } from './types';

const TEMPLATE = `import { createSharedComposable } from '@vueuse/core';
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

export const useSharedLetgoGlobal = createSharedComposable(useLetgoGlobal);
`;

export const GLOBAL_STATE_FILE_NAME = 'useLetgoGlobal';

const globalStateKeys: string[] = [];
function genGlobalStateKeys(codeStruct: CodeStruct) {
    const codeMap = genCodeMap(codeStruct);
    return Array.from(codeMap.keys());
}

function getGlobalContextKey() {
    return globalStateKeys;
}

let hasGlobal: boolean;
function getGlobalFlag() {
    return hasGlobal;
}

function compilerNpmImports(npm: IPublicTypeNpmInfo): ImportSource {
    return {
        source: npm.package,
        imported: npm.exportName,
        type: ImportType.ImportDefaultSpecifier,
        main: npm.main,
    };
}

function genUtilsImports(utils: IPublicTypeUtilsMap): ImportSource[] {
    return utils.filter(item => item.type !== 'function').map((item) => {
        return compilerNpmImports(item.content as IPublicTypeNpmInfo);
    });
}

export function compilerUtils(utils: IPublicTypeUtilsMap) {
    const importSources = genUtilsImports(utils);
    const code = utils.map((item) => {
        if (item.type === 'function')
            return `${item.name}: ${item.content.value}`;
        else
            return `${item.name}`;
    }).join(',');

    return {
        code: `
        const utils = {
            ${code}
        };
        `,
        importSources,
    };
}

export function genGlobalStateCode(schema: IPublicTypeProjectSchema) {
    globalStateKeys.length = 0;
    hasGlobal = !!(schema.code || schema.config);
    if (!hasGlobal)
        return null;

    let tmp = TEMPLATE.replace('CONFIG', JSON.stringify(schema.config || {}));

    const importSources: ImportSource[] = [];
    let code = '';

    if (schema.utils) {
        const result = compilerUtils(schema.utils);
        importSources.push(...result.importSources);
        code += result.code;
        globalStateKeys.push('utils');
    }

    if (schema.code) {
        const result = genCode(schema.code);
        importSources.push(...result.importSources);
        globalStateKeys.push(...genGlobalStateKeys(schema.code));
        code += result.code;
    }
    tmp = tmp.replace('IMPORTS', importSources.length ? genImportCode(importSources) : '');
    tmp = tmp.replace('STATE_CODE', code);
    tmp = tmp.replace('CODE_KEYS', globalStateKeys.length ? globalStateKeys.join(',') : '');

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
