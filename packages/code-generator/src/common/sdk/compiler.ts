import type { IPublicTypeComponentMap, IPublicTypeRootSchema } from '@webank/letgo-types';
import { ImportType, PageFileType } from '../types';
import type { Context, FileStruct, ImportSource, SetupCode } from '../types';
import { formatFileName, formatPageName, formatPageTitle, genPageEntry } from '../page-meta';
import { genComponentImports } from '../script';
import { genGlobalState } from '../global-state';
import { CLASS_FILE_NAME, CLASS_NAME, genClassCode } from '../../class-code/gen-class-code';

function genComponentMap(codeImports: ImportSource[]) {
    return `
    const components = {
        ${codeImports.filter((item) => {
            return item.alias || item.imported;
        }).map((item) => {
            return `'${item.alias || item.imported}': ${item.alias || item.imported}`;
        }).join(',')}
    };`;
}

function genSchema(ctx: Context, rootSchema: IPublicTypeRootSchema): SetupCode {
    let result: SetupCode;
    if (rootSchema.classCode && ctx.config.sdkRenderConfig?.pickClassCode) {
        const schema = {
            ...rootSchema,
            classCode: '__$$CLASS_CODE',
        };
        result = {
            code: `const schema = ${JSON.stringify(schema, null, 2).replace(/\"__\$\$CLASS_CODE\"/, CLASS_NAME)};`,
            importSources: [{
                imported: CLASS_NAME,
                type: ImportType.ImportSpecifier,
                source: `./${CLASS_FILE_NAME}`,
            }],
        };
    }
    else {
        result = {
            code: `const schema = ${JSON.stringify(rootSchema, null, 2)};`,
            importSources: [],
        };
    }

    return ctx.config.transformGenSchema ? ctx.config.transformGenSchema(result) : result;
}

function genSdkRender(ctx: Context) {
    const jsxCode = `return () => {
        return <Renderer schema={schema} components={components} />
    }`;

    return ctx.config.transformSdkJsx ? ctx.config.transformSdkJsx(jsxCode) : jsxCode;
}

function genGlobalCode(usedGlobalVar: string[]): SetupCode {
    if (!usedGlobalVar.length) {
        return {
            importSources: [],
            code: '',
        };
    }
    return {
        importSources: [
            {
                imported: 'getGlobalContextKey',
                source: '@webank/letgo-renderer',
                type: ImportType.ImportSpecifier,
            },
            {
                imported: 'provide',
                source: 'vue',
                type: ImportType.ImportSpecifier,
            },
        ],
        code: `provide(getGlobalContextKey(), {${usedGlobalVar.join()}});`,
    };
}

/**
 * TODO
 * classCode 问题
 */
export function compileRootSchemaFormSDK(
    ctx: Context,
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
): FileStruct {
    if (['Page', 'Component'].includes(rootSchema.componentName)) {
        const fileName = formatFileName(rootSchema.fileName);

        const filePath = `${ctx.config.outDir}/${genPageEntry(fileName, !!rootSchema.classCode)}`;
        const codeImports = genComponentImports(ctx, componentMaps, filePath);
        const globalStateSnippet = genGlobalState(ctx, filePath, rootSchema);
        const injectGlobalCodeSnippet = genGlobalCode(globalStateSnippet.useGlobalVariables);
        const schemaSnippet = genSchema(ctx, rootSchema);

        return {
            rawFileName: rootSchema.fileName,
            fileType: PageFileType.Jsx,
            fileName,
            routeName: formatPageName(fileName),
            pageTitle: formatPageTitle(rootSchema.title),
            afterImports: [genComponentMap(codeImports)],
            importSources: [].concat(
                globalStateSnippet.importSources,
                injectGlobalCodeSnippet.importSources,
                codeImports,
                schemaSnippet.importSources,
                {
                    imported: 'Renderer',
                    source: '@webank/letgo-renderer',
                    type: ImportType.ImportSpecifier,
                },
            ),
            classCode: ctx.config.sdkRenderConfig?.pickClassCode ? genClassCode({ ctx, fileName, rootSchema }) : null,
            codes: [globalStateSnippet.code, injectGlobalCodeSnippet.code, schemaSnippet.code].filter(Boolean),
            jsx: genSdkRender(ctx),
        };
    }
    return null;
}
