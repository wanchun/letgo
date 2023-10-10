import type { CodeStruct, IPublicTypeNpmInfo, IPublicTypeProjectSchema, IPublicTypeUtilsMap } from '@harrywan/letgo-types';
import { genCode, genCodeMap, genImportCode } from './helper';
import type { ImportSource, SetupCode } from './types';
import { ImportType } from './types';

const TEMPLATE = `import { createSharedComposable } from '@vueuse/core';
IMPORTS

function useLetgoGlobal() {

    STATE_CODE

    return {
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
        type: npm.destructuring ? ImportType.ImportSpecifier : ImportType.ImportDefaultSpecifier,
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

interface CallBackParam {
    import: ImportSource[]
    code: string
    export: string[]
}

export function genGlobalStateCode(schema: IPublicTypeProjectSchema, callback?: {
    afterConfig?: (params: CallBackParam) => void
}) {
    globalStateKeys.length = 0;
    hasGlobal = !!(schema.code || schema.config || schema.utils);
    if (!hasGlobal)
        return null;

    const result: CallBackParam = {
        import: [],
        code: '',
        export: [],
    };

    if (schema.config) {
        result.import.push({
            type: ImportType.ImportSpecifier,
            imported: 'reactive',
            source: 'vue',
        });
        result.code += `
    const letgoContext = ${JSON.stringify(schema.config || {})};
        `;
        result.export.push('letgoContext');
        callback?.afterConfig?.(result);
    }

    if (schema.utils) {
        const _result = compilerUtils(schema.utils);
        result.import.push(..._result.importSources);
        result.code += _result.code;
        result.export.push('utils');
    }

    if (schema.code) {
        const _result = genCode(schema.code);
        result.import.push(..._result.importSources);
        result.code += _result.code;
        result.export.push(...genGlobalStateKeys(schema.code));
    }

    let tmp = TEMPLATE.replace('IMPORTS', result.import.length ? genImportCode(result.import) : '');
    tmp = tmp.replace('STATE_CODE', result.code);
    tmp = tmp.replace('CODE_KEYS', result.export.length ? result.export.join(',') : '');

    globalStateKeys.push(...result.export);

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
        code: `const {${getGlobalContextKey().join(', ')}} = useSharedLetgoGlobal()`,
    };
}
