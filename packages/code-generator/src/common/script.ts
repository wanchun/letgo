import type {
    IPublicTypeComponentMap, IPublicTypeRootSchema,
} from '@harrywan/letgo-types';
import {
    isProCodeComponentType,
} from '@harrywan/letgo-types';
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

function genRefCode(componentRefs: Set<string>) {
    if (!componentRefs.size) {
        return {
            importSources: [],
            code: '',
        };
    }
    const code = Array.from(componentRefs).map((item) => {
        return `const [${item}RefEl, ${item}] = useInstance()`;
    }).join('\n');
    return {
        importSources: [{
            imported: 'useInstance',
            type: ImportType.ImportSpecifier,
            source: '@/use/useInstance',
        }],
        code,
    };
}

export function genScript({ componentMaps, rootSchema, componentRefs }: {
    componentMaps: IPublicTypeComponentMap[]
    rootSchema: IPublicTypeRootSchema
    componentRefs: Set<string>
},
): [ImportSource[], string[]] {
    const codeImports = genComponentImports(componentMaps);
    const globalStateSnippet = applyGlobalState();
    const refCodeSnippet = genRefCode(componentRefs);
    const codesSnippet = genCode(rootSchema.code);

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
