import type {
    CodeItem,
    CodeStruct,
    IPublicTypeComponentMap,
    IPublicTypeNpmInfo, IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isProCodeComponentType,
} from '@webank/letgo-types';
import { calcDependencies, checkCycleDependency } from '@webank/letgo-common';
import { getCurrentContext } from './compiler-context';

function genComponentImports(componentMaps: IPublicTypeComponentMap[]) {
    const pkgs: Record<string, IPublicTypeNpmInfo[]> = {};
    componentMaps.forEach((componentMap) => {
        if (isProCodeComponentType(componentMap)) {
            if (pkgs[componentMap.package])
                pkgs[componentMap.package].push(componentMap);

            else
                pkgs[componentMap.package] = [componentMap];
        }
    });

    return Object.keys(pkgs).map((pkg) => {
        return `import {${pkgs[pkg]
            .map(item => item.exportName)
            .join(', ')}} from '${pkg}';`;
    });
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

function genConfigKeys(config: Record<string, any>) {
    return Object.keys(config).join(', ');
}

export function genScript(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
) {
    const context = getCurrentContext();
    if (rootSchema.code) {
        return `<script setup>
            import {useLetgoConfig} from '@/use/useLetgoGlobal';
            ${genComponentImports(componentMaps)}

            const {${genConfigKeys(context.config)}} = useLetgoConfig();
        </script>`;
    }
    return '';
}
