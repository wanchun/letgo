import type {
    ICodeStruct,
    IPublicTypeNpmInfo,
    IPublicTypeUtilsMap,
} from '@webank/letgo-types';
import { genCodeMap } from '@webank/letgo-common';
import { set } from 'lodash-es';
import { getOptions, relative } from '../options';
import { genCode, genImportCode } from './helper';
import type { CallBackParam, Context, FileTree, GenOptions, ImportSource, SetupCode } from './types';
import { ImportType } from './types';

export const GLOBAL_STATE_FILE_NAME = 'useLetgoGlobal';

const TEMPLATE = `
IMPORTS

function ${GLOBAL_STATE_FILE_NAME}() {

    STATE_CODE

    return {
        CODE_KEYS
    };
}

export const useSharedLetgoGlobal = createSharedComposable(${GLOBAL_STATE_FILE_NAME});
`;

const globalStateKeys: string[] = [];
function genGlobalStateKeys(codeStruct: ICodeStruct) {
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
        type: npm.assembling ? ImportType.ImportAll : (npm.destructuring ? ImportType.ImportSpecifier : ImportType.ImportDefaultSpecifier),
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

export function genGlobalStateCode(ctx: Context, fileTree: FileTree, options: GenOptions): void {
    const { schema, letgoDir, globalCodeCallback } = options;
    globalStateKeys.length = 0;
    hasGlobal = !!(schema.code || schema.config || schema.utils);
    if (!hasGlobal)
        return null;

    const result: CallBackParam = {
        import: [{
            source: '@vueuse/core',
            imported: 'createSharedComposable',
            type: ImportType.ImportSpecifier,
        }, {
            source: 'vue',
            imported: 'reactive',
            type: ImportType.ImportSpecifier,
        }],
        code: '',
        export: [],
    };

    if (schema.config) {
        result.code += `
    const letgoContext = reactive(${JSON.stringify(schema.config || {})});
        `;
        result.export.push('letgoContext');
        globalCodeCallback?.afterConfig?.(result);
    }

    if (schema.utils) {
        const _result = compilerUtils(schema.utils);
        result.import.push(..._result.importSources);
        result.code += _result.code;
        result.export.push('utils');
    }

    if (schema.code) {
        const _result = genCode(ctx, `${letgoDir}/${GLOBAL_STATE_FILE_NAME}.js`, schema.code);
        result.import.push(..._result.importSources);
        result.code += _result.code;
        result.export.push(...genGlobalStateKeys(schema.code));
    }

    let tmp = TEMPLATE.replace('IMPORTS', result.import.length ? genImportCode(result.import) : '');
    tmp = tmp.replace('STATE_CODE', result.code);
    tmp = tmp.replace('CODE_KEYS', result.export.length ? result.export.join(',') : '');

    globalStateKeys.push(...result.export);

    set(fileTree, `${letgoDir}/${GLOBAL_STATE_FILE_NAME}.js`.split('/'), tmp);
}

export function applyGlobalState(filePath: string): SetupCode {
    const { letgoDir } = getOptions();
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
            source: relative(filePath, `${letgoDir}/${GLOBAL_STATE_FILE_NAME}`),
        }],
        code: `const {${getGlobalContextKey().join(', ')}} = useSharedLetgoGlobal()`,
    };
}
