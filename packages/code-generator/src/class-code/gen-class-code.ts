import type { IPublicTypeRootSchema } from '@webank/letgo-types';
import { astToCode, simpleWalkAst } from '@webank/letgo-common';
import type { Declaration } from 'acorn';
import type { Context, FileStruct } from '../common/types';
import { ImportType } from '../common/types';
import { relative } from '../options';
import { genImportCode } from '../common/helper';

export const CLASS_FILE_NAME = 'main';
export const CLASS_NAME = 'Main';

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
        code: rootSchema.classCode,
    };
}

export function genClassCodeStr(fileStruct: FileStruct) {
    const codeAst = simpleWalkAst(fileStruct.classCode.code, {
        ClassDeclaration(node: any) {
            if (node.superClass)
                node.superClass.name = 'LetgoPageBase';
        },
    });
    const index = codeAst.body.findIndex(node => node.type === 'ClassDeclaration');
    codeAst.body[index] = {
        type: 'ExportNamedDeclaration',
        start: 0,
        end: 0,
        declaration: codeAst.body[index] as Declaration,
        specifiers: [],
        source: null,
    };

    return `
        ${genImportCode(fileStruct.classCode.importSources)}
        
        ${astToCode(codeAst)}
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
            imported: CLASS_NAME,
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
        const $$ = reactive(new ${CLASS_NAME}({
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
