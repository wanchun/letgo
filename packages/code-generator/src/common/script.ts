import path from 'node:path';
import type {
    IPublicTypeComponentMap,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isProCodeComponentType,
} from '@webank/letgo-types';
import { getOptions, relative } from '../options';
import { genCode } from './helper';
import { ImportType } from './types';
import type { Context, ImportSource } from './types';
import { applyGlobalState } from './global-state';

function genComponentImports(componentMaps: IPublicTypeComponentMap[]) {
    const importSources: ImportSource[] = [];
    componentMaps.forEach((componentMap) => {
        if (isProCodeComponentType(componentMap)) {
            importSources.push({
                source: componentMap.package,
                type: ImportType.ImportSpecifier,
                imported: componentMap.exportName,
            });
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

    const codeImports = genComponentImports(componentMaps);
    const globalStateSnippet = applyGlobalState(`${outDir}/${fileName}`);
    const refCodeSnippet = genRefCode(`${outDir}/${fileName}`, componentRefs);
    const codesSnippet = genCode(ctx, `${outDir}/${fileName}`, rootSchema.code);

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
