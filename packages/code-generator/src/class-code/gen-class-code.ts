import type { IPublicTypeRootSchema } from '@webank/letgo-types';
import type { Context, FileStruct } from '../common/types';
import { ImportType } from '../common/types';
import { relative } from '../options';
import { genImportCode } from '../common/helper';

export const CLASS_FILE_NAME = 'main';

export function genClassCode({ ctx, fileName, rootSchema }: {
    ctx: Context;
    fileName: string;
    rootSchema: IPublicTypeRootSchema;
}) {
    if (!rootSchema.classCode)
        return null;

    const filePath = `${ctx.config.outDir}/${fileName}/${CLASS_FILE_NAME}`;
    return {
        importSources: [{
            imported: 'LetgoPageBase',
            type: ImportType.ImportSpecifier,
            source: relative(filePath, `${ctx.config.letgoDir}/pageBase`),
        }],
        code: rootSchema.classCode.replace('Page', 'LetgoPageBase'),
    };
}

export function genClassCodeStr(fileStruct: FileStruct) {
    return `
        ${genImportCode(fileStruct.classCode.importSources)}
        
        export ${fileStruct.classCode.code.trim()}
    `;
}

export function genClassCodeInstance(ctx: Context, rootSchema: IPublicTypeRootSchema) {
    if (!rootSchema.classCode) {
        return {
            importSources: [],
            code: '',
        };
    }

    return {
        importSources: [{
            imported: 'Main',
            type: ImportType.ImportSpecifier,
            source: `./${CLASS_FILE_NAME}`,
        }, {
            imported: 'reactive',
            type: ImportType.ImportSpecifier,
            source: `vue`,
        }].concat(ctx.classLifeCycle.map((item) => {
            return {
                imported: item,
                type: ImportType.ImportSpecifier,
                source: `vue`,
            };
        })),
        code: `
        const $$ = reactive(new Main({
            globalContext: {
                ${ctx.classUseCodes.$globalCode.join(',\n')}
            },
            instances: {
                ${ctx.classUseCodes.$refs.join(',\n')}
            },
            codes: {
                ${ctx.classUseCodes.$pageCode.join(',\n')}
            }
        }))
        
        ${ctx.classLifeCycle.map((item) => {
            return `${item}($$.${item}.bind($$))`;
        }).join(';\n')}
        `,
    };
}
