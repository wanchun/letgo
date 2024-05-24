import type {
    ICodeStruct,
} from '@webank/letgo-types';
import { genCodeMap } from '@webank/letgo-common';
import {
    IEnumCodeType,
} from '@webank/letgo-types';
import type { Context, ImportSource, SetupCode } from './types';
import { ImportType } from './types';

export function genHook(ctx: Context, filePath: string, codeStruct: ICodeStruct): SetupCode {
    if (!codeStruct)
        return null;

    const codeStr: string[] = [];
    const importSources: ImportSource[] = [];
    const codeMap = genCodeMap(codeStruct);

    codeMap.forEach((item) => {
        if (item.type === IEnumCodeType.LIFECYCLE_HOOK) {
            if (item.hookName && item.funcBody) {
                importSources.push({
                    imported: item.hookName,
                    type: ImportType.ImportSpecifier,
                    source: 'vue',
                });
                codeStr.push(`
                ${item.hookName}(async ()=>{
                    ${item.funcBody}
                })
                `);
            }
        }
    });

    return {
        importSources,
        code: codeStr.join('\n'),
    };
}
