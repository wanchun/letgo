import { ProjectSchema, RootSchema } from '@webank/letgo-types';
import { genPageTemplate } from './genTemplate';
import { genStyle } from './style';
import { genScript } from './script';

function compileRootSchema(rootSchema: RootSchema) {
    if (rootSchema.componentName === 'Page') {
        return {
            template: genPageTemplate(rootSchema),
            script: genScript(rootSchema),
            style: genStyle(rootSchema),
        };
    }
    return {};
}

export function schemaToCode(schema: ProjectSchema) {
    const rootComponents = schema.componentsTree.map(compileRootSchema);
    console.log(rootComponents);
}
