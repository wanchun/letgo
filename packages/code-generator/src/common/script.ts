import type {
    IPublicTypeComponentMap,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isLowCodeComponentType,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { getOptions, relative } from '../options';
import { genCode } from './helper';
import { ImportType } from './types';
import type { Context, ImportSource } from './types';
import { applyGlobalState } from './global-state';
import { getLowComponentFilePath } from './lowcode-component';

function genComponentImports(ctx: Context, componentMaps: IPublicTypeComponentMap[], filePath: string) {
    const importSources: ImportSource[] = [];
    componentMaps.forEach((componentMap) => {
        if (isProCodeComponentType(componentMap)) {
            importSources.push({
                source: componentMap.package,
                type: ImportType.ImportSpecifier,
                imported: componentMap.exportName || componentMap.componentName,
            });
        }
        else if (isLowCodeComponentType(componentMap)) {
            const lowCodeCompSchema = ctx.schema.packages.find(item => item.type === 'lowCode' && item.library === componentMap.componentName);
            if (lowCodeCompSchema) {
                importSources.push({
                    source: relative(filePath, getLowComponentFilePath(ctx, componentMap.componentName)),
                    type: ImportType.ImportSpecifier,
                    imported: componentMap.componentName,
                });
            }
        }
    });

    return importSources;
}

function genRefCode(filePath: string, componentRefs: Set<string>) {
    const options = getOptions();
    if (!options)
        return;

    if (!componentRefs.size) {
        return {
            importSources: [],
            code: '',
        };
    }

    const code = Array.from(componentRefs).map((item) => {
        return `const [${item}RefEl, ${item}] = useInstance()`;
    }).join('\n');

    const { letgoDir } = options;

    return {
        importSources: [{
            imported: 'useInstance',
            type: ImportType.ImportSpecifier,
            source: relative(filePath, `${letgoDir}/useInstance`),
        }],
        code,
    };
}

export function genScript({ ctx, componentMaps, rootSchema, componentRefs, fileName }: {
    ctx: Context;
    componentMaps: IPublicTypeComponentMap[];
    rootSchema: IPublicTypeRootSchema;
    componentRefs: Set<string>;
    fileName: string;
},
): [ImportSource[], string[]] {
    const options = getOptions();
    if (!options)
        return;

    const { outDir } = options;
    const filePath = `${outDir}/${fileName}`;
    const codeImports = genComponentImports(ctx, componentMaps, filePath);
    const globalStateSnippet = applyGlobalState(rootSchema, filePath);
    const refCodeSnippet = genRefCode(filePath, componentRefs);
    const codesSnippet = genCode(ctx, filePath, rootSchema.code);

    const codes = [
        globalStateSnippet.code,
        refCodeSnippet.code,
        codesSnippet?.code,
    ].filter(Boolean);

    return [
        globalStateSnippet.importSources.concat(codeImports, refCodeSnippet.importSources, codesSnippet?.importSources).filter(Boolean),
        codes,
    ];
}
