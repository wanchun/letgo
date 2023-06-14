import type {
    CodeItem,
    CodeStruct,
    IPublicTypeComponentMap, IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isProCodeComponentType,
} from '@webank/letgo-types';
import { calcDependencies, checkCycleDependency } from '@webank/letgo-common';
import { getCurrentContext } from './compiler-context';
import { genGlobalConfig } from './global-config';
import { genImportCode } from './helper';
import { type ImportSource, ImportType } from './types';

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

function genCodeMap(code: CodeStruct) {
    const codeMap = new Map<string, CodeItem>();
    code.code.forEach((item) => {
        codeMap.set(item.id, item);
    });

    code.directories.forEach((directory) => {
        directory.code.forEach((item) => {
            codeMap.set(item.id, item);
        });
    });
    return codeMap;
}

function genCode(schema: IPublicTypeRootSchema) {
    const codeMap = genCodeMap(schema.code);
    const dependencyMap = new Map<string, string[]>();

    for (const [codeId, item] of codeMap)
        dependencyMap.set(codeId, calcDependencies(item, codeMap));

    const sortResult = checkCycleDependency(dependencyMap);
    sortResult.reverse().forEach((codeId) => {
        const item = codeMap.get(codeId);
        // TODO 处理 expression
    });
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

export function genScript(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
    componentRefs: Set<string>,
) {
    const context = getCurrentContext();
    const configCodeSnippet = genGlobalConfig(context.config);
    const refCode = genRefCode(componentRefs);
    const codeImports = genComponentImports(componentMaps);
    return `<script setup>
            ${genImportCode(configCodeSnippet.importSources.concat(codeImports, refCode.importSources))}
            ${genComponentImports(componentMaps)}
            ${configCodeSnippet.code}
            ${refCode.code}
        </script>`;
    return '';
}
