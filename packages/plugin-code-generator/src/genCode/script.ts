import {
    RootSchema,
    ComponentMap,
    NpmInfo,
    isProCodeComponentType,
} from '@webank/letgo-types';

function genComponentImports(componentMaps: ComponentMap[]) {
    const pkgs: Record<string, NpmInfo[]> = {};
    componentMaps.forEach((componentMap) => {
        if (isProCodeComponentType(componentMap)) {
            if (pkgs[componentMap.package]) {
                pkgs[componentMap.package].push(componentMap);
            } else {
                pkgs[componentMap.package] = [componentMap];
            }
        }
    });

    return Object.keys(pkgs).map((pkg) => {
        return `import {${pkgs[pkg]
            .map((item) => item.componentName)
            .join(', ')}} from '${pkg}';`;
    });
}

export function genScript(
    componentMaps: ComponentMap[],
    rootSchema: RootSchema,
) {
    if (rootSchema.code) {
        return `<script setup>
            ${genComponentImports(componentMaps)}
            ${rootSchema.code || ''}
        </script>`;
    }
    return '';
}
