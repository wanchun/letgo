import type {
    IPublicTypeComponentMap,
    IPublicTypeNpmInfo,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isProCodeComponentType,
} from '@webank/letgo-types';

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

export function genScript(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
) {
    if (rootSchema.code) {
        return `<script setup>
            ${genComponentImports(componentMaps)}
            ${rootSchema.code || ''}
        </script>`;
    }
    return '';
}
