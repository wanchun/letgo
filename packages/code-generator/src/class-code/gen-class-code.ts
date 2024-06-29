import type { IPublicTypeRootSchema } from '@webank/letgo-types';
import type { Context } from '../common/types';
import { ImportType } from '../common/types';
import { relative } from '../options';

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
            source: relative(filePath, `${ctx.config.letgoDir}/page-base`),
        }],
        code: rootSchema.classCode.replace('Component', 'LetgoPageBase'),
    };
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
        }],
        code: `
        const $$ = reactive(new Main({
            globalContext: {
                ${ctx.classUseCodes.$globalCode.join(',')}
            },
            instances: {
                ${ctx.classUseCodes.$refs.join(',')}
            },
            codes: {
                ${ctx.classUseCodes.$pageCode.join(',')}
            }
        }))
        `,
    };
}
