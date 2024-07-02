import type {
    IPublicTypeComponentMap,
    IPublicTypeNodeData,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import { genCodeMap, traverseNodeSchema } from '@webank/letgo-common';
import { parseCode } from '../class-code/parse';
import { genClassCode } from '../class-code/gen-class-code';
import { transformThis } from '../class-code/transform-this';
import { genScript } from './script';
import { formatFileName, formatPageName, formatPageTitle } from './page-meta';
import { PageFileType } from './types';
import type { Context, FileStruct } from './types';
import { genPageJsx, genSlots } from './jsx/gen-jsx';
import { parseUseVariables } from './parse-utils';

function getComponentRefs(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentRefs: Set<string> = new Set();
    traverseNodeSchema(nodeData, (item) => {
        componentRefs.add(item.ref);
    });
    return componentRefs;
}

function getUseComponentRefs(ctx: Context) {
    const componentRefs = ctx.refs;
    const usedComponents = new Set<string>(ctx.classUseCodes?.$refs || []);
    for (const refName of componentRefs.values()) {
        if (ctx.useVariables.has(refName))
            usedComponents.add(refName);
    }
    return usedComponents;
}

function compileRootSchema(
    ctx: Context,
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
): FileStruct {
    if (['Page', 'Component'].includes(rootSchema.componentName)) {
        const componentRefs = getUseComponentRefs(ctx);
        const fileName = formatFileName(rootSchema.fileName);

        const [importSources, codes] = genScript({
            ctx,
            componentMaps,
            rootSchema,
            componentRefs,
            fileName,
        });

        return {
            rawFileName: rootSchema.fileName,
            fileType: PageFileType.Jsx,
            fileName,
            routeName: formatPageName(fileName),
            pageTitle: formatPageTitle(rootSchema.title),
            afterImports: [],
            importSources,
            classCode: genClassCode({ ctx, fileName, rootSchema }),
            codes: codes.concat(genSlots(ctx, rootSchema, componentRefs)),
            jsx: genPageJsx(ctx, rootSchema, componentRefs),
        };
    }
    return null;
}

function getUseComponentNames(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentNames: Set<string> = new Set();
    traverseNodeSchema(nodeData, (item) => {
        componentNames.add(item.componentName);
    });
    return componentNames;
}

export function getUseComponents(
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
) {
    const componentNames = getUseComponentNames(rootSchema.children);
    const useComponents: IPublicTypeComponentMap[] = [];
    for (const componentName of componentNames.values()) {
        const component = componentMaps.find(
            item => item.componentName === componentName,
        );
        if (component)
            useComponents.push(component);
    }

    return useComponents;
}

// TODO scope 放入 codes 或者另外加一个参数
export function schemaToCode(ctx: Context): FileStruct[] {
    return ctx.schema.componentsTree.map((rootSchema) => {
        const { classLifeCycle, usedCode } = parseCode(rootSchema.classCode);
        const pageContext: Context = {
            ...ctx,
            codes: genCodeMap(rootSchema.code, new Map(ctx.codes)),
            refs: getComponentRefs(rootSchema.children),
            classUseCodes: usedCode,
            classLifeCycle,
            useVariables: parseUseVariables(rootSchema, usedCode),
        };

        return compileRootSchema(
            pageContext,
            getUseComponents(ctx.schema.componentsMap, rootSchema),
            transformThis(rootSchema),
        );
    }).filter(Boolean);
}
