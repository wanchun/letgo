import path from 'node:path';
import type {
    IPublicTypeComponentMap,
    IPublicTypeRootSchema,
} from '@harrywan/letgo-types';
import {
    isProCodeComponentType,
} from '@harrywan/letgo-types';
import { getOptions, relative } from '../options';
import { genCode } from './helper';
import { ImportType } from './types';
import type { ImportSource } from './types';
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

    const { outDir } = options;

    return {
        importSources: [{
            imported: 'useInstance',
            type: ImportType.ImportSpecifier,
            source: relative(filePath, `${outDir}/useInstance`),
        }],
        code,
    };
}

export function genScript({ componentMaps, rootSchema, componentRefs, fileName }: {
    componentMaps: IPublicTypeComponentMap[]
    rootSchema: IPublicTypeRootSchema
    componentRefs: Set<string>
    fileName: string
},
): [ImportSource[], string[]] {
    const options = getOptions();
    if (!options)
        return;

    const { pageDir } = options;

    const codeImports = genComponentImports(componentMaps);
    const globalStateSnippet = applyGlobalState(`${pageDir}/${fileName}`);
    const refCodeSnippet = genRefCode(`${pageDir}/${fileName}`, componentRefs);
    const codesSnippet = genCode(`${pageDir}/${fileName}`, rootSchema.code);

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
