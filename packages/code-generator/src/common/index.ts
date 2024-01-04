import type {
    IPublicTypeComponentMap,
    IPublicTypeNodeData,
    IPublicTypeProjectSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import { traverseNodeSchema } from '@webank/letgo-common';
import { genScript } from './script';
import { genCodeMap } from './helper';
import { formatFileName, formatPageName, formatPageTitle } from './page-meta';
import { PageFileType } from './types';
import type { Context, FileStruct } from './types';
import { genPageJsx, genSlots } from './jsx/gen-jsx';

function getComponentRefs(
    nodeData: IPublicTypeNodeData | IPublicTypeNodeData[],
) {
    const componentRefs: Set<string> = new Set();
    traverseNodeSchema(nodeData, (item) => {
        componentRefs.add(item.ref);
    });
    return componentRefs;
}

function getUseComponentRefs(ctx: Context, rootSchema: IPublicTypeRootSchema) {
    const componentRefs = ctx.refs;
    const usedComponents = new Set<string>();
    const schemaStr = JSON.stringify(rootSchema);
    for (const refName of componentRefs.values()) {
        // REFACTOR 有可能误杀
        if (schemaStr.includes(`${refName}.`))
            usedComponents.add(refName);
    }
    return usedComponents;
}

function compileRootSchema(
    ctx: Context,
    componentMaps: IPublicTypeComponentMap[],
    rootSchema: IPublicTypeRootSchema,
): FileStruct {
    if (rootSchema.componentName === 'Page') {
        const componentRefs = getUseComponentRefs(ctx, rootSchema);
        const fileName = formatFileName(rootSchema.fileName);

        const [importSources, codes] = genScript({
            componentMaps,
            rootSchema,
            componentRefs,
            fileName,
        });

        return {
            fileType: PageFileType.Jsx,
            filename: fileName,
            routeName: formatPageName(fileName),
            pageTitle: formatPageTitle(rootSchema.title),
            afterImports: [],
            importSources,
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

function getUseComponents(
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
export function schemaToCode(ctx: Context, schema: IPublicTypeProjectSchema): FileStruct[] {
    return schema.componentsTree.map((rootSchema) => {
        const pageContext = {
            ...ctx,
            codes: genCodeMap(rootSchema.code, new Map(ctx.codes)),
            refs: getComponentRefs(rootSchema.children),
        };
        return compileRootSchema(
            pageContext,
            getUseComponents(schema.componentsMap, rootSchema),
            rootSchema,
        );
    }).filter(Boolean);
}
