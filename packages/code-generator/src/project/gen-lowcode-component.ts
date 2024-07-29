import { set } from 'lodash-es';
import type { IPublicTypeComponentSchema } from '@webank/letgo-types';
import { genCodeMap } from '@webank/letgo-common';
import type { Context, FileTree } from '../common/types';
import { schemaToCode } from '../common';
import { findRootSchema } from '../common/helper';
import { fileStructToLowcodeComponent } from '../lowcode-component/file-struct';
import { LOW_COMPONENT_DIR } from '../common/lowcode-component';

export function genLowCodeComponent(ctx: Context, fileTree: FileTree) {
    const { letgoDir, transformComponentJsx } = ctx.config;
    const components: Record<string, string> = {};
    const componentDir = `${letgoDir}/${LOW_COMPONENT_DIR}`;
    for (const pkg of ctx.schema.packages) {
        if (pkg.type === 'lowCode') {
            const newCtx = {
                ...ctx,
                config: {
                    ...ctx.config,
                    outDir: componentDir,
                },
                codes: genCodeMap(pkg.schema.code),
                schema: pkg.schema,
            };
            const filesStruct = transformComponentJsx ? transformComponentJsx(schemaToCode(newCtx)) : schemaToCode(newCtx);

            const fileStruct = filesStruct[0];
            const rootSchema = findRootSchema(pkg.schema, fileStruct.rawFileName) as IPublicTypeComponentSchema;
            components[`${rootSchema.fileName}.jsx`] = fileStructToLowcodeComponent(fileStruct, rootSchema, pkg.schema.utils);
        }
    }

    set(fileTree, `${letgoDir}/${LOW_COMPONENT_DIR}`.split('/'), components);
}
