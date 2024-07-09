import type {
    IPublicTypeComponentMap,
    IPublicTypeNpmInfo,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    isLowCodeComponentType,
    isProCodeComponentType,
} from '@webank/letgo-types';
import { startCase } from 'lodash-es';
import { relative } from '../options';
import { genClassCodeInstance } from '../class-code/gen-class-code';
import { genCode } from './helper';
import { ImportType } from './types';
import { genGlobalState } from './global-state';
import { getLowComponentFilePath } from './lowcode-component';
import { genHook } from './hook';
import { cssResolver } from './resolver';
import type { Context, ImportSource } from './types';
import { genPageEntry } from './page-meta';

function getAliasExportName(componentMap: IPublicTypeNpmInfo) {
    const cName = startCase(componentMap.componentName).replace(/ /g, '');
    if (componentMap.exportName.toLowerCase() === cName.toLowerCase())
        return null;

    return cName;
}

export function genComponentImports(ctx: Context, componentMaps: IPublicTypeComponentMap[], filePath: string) {
    const importSources: ImportSource[] = [];
    componentMaps.forEach((componentMap) => {
        if (isProCodeComponentType(componentMap)) {
            importSources.push({
                source: componentMap.package,
                type: ImportType.ImportSpecifier,
                imported: componentMap.exportName || componentMap.componentName,
                alias: getAliasExportName(componentMap),
            });
            cssResolver(componentMap, ctx.schema).forEach((importSource) => {
                importSources.push(importSource);
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

function genRefCode(ctx: Context, filePath: string, componentRefs: Set<string>) {
    const options = ctx.config;
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
    const options = ctx.config;
    if (!options)
        return;

    const { outDir } = options;
    const filePath = `${outDir}/${genPageEntry(fileName, !!rootSchema.classCode)}`;
    const codeImports = genComponentImports(ctx, componentMaps, filePath);
    const globalStateSnippet = genGlobalState(ctx, filePath, rootSchema);
    const refCodeSnippet = genRefCode(ctx, filePath, componentRefs);
    const codesSnippet = genCode(ctx, filePath, rootSchema.code);
    const hookSnippet = genHook(ctx, filePath, rootSchema.code);
    const classCodeSnippet = genClassCodeInstance(ctx, rootSchema);

    const codes = [
        globalStateSnippet.code,
        refCodeSnippet.code,
        codesSnippet?.code,
        hookSnippet?.code,
        classCodeSnippet?.code,
    ].filter(Boolean);

    return [
        [].concat(
            codeImports,
            globalStateSnippet.importSources,
            refCodeSnippet.importSources,
            hookSnippet.importSources,
            codesSnippet?.importSources,
            classCodeSnippet?.importSources,
        ).filter(Boolean),
        codes,
    ];
}
