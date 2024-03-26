import { set } from 'lodash-es';
import type { IPublicTypeComponentSchema } from '@webank/letgo-types';
import { genCodeMap } from '@webank/letgo-common';
import type { Context, FileTree } from '../common/types';
import { schemaToCode } from '../common';
import { findRootSchema } from '../common/helper';
import { fileStructToLowcodeComponent } from '../lowcode-component/file-struct';
import { compNameToFileName } from '../lowcode-component/file-name';
import { LOW_COMPONENT_DIR } from '../common/lowcode-component';

export function genLowcodeComponent(ctx: Context, fileTree: FileTree) {
    const { letgoDir } = ctx.config;
    const components: Record<string, string> = {};
    const componentDir = `${letgoDir}/${LOW_COMPONENT_DIR}`;
    for (const pkg of ctx.schema.packages) {
        if (pkg.type === 'lowCode') {
            const newCtx = {
                ...ctx,
                config: {
                    ...ctx,
                    outDir: componentDir,
                },
                codes: genCodeMap(pkg.schema.code),
                schema: pkg.schema,
            };
            const filesStruct = schemaToCode(newCtx);

            const fileStruct = filesStruct[0];
            const rootSchema = findRootSchema(pkg.schema, fileStruct.rawFileName) as IPublicTypeComponentSchema;
            components[`${compNameToFileName(rootSchema.fileName)}.jsx`] = fileStructToLowcodeComponent(fileStruct, rootSchema, pkg.schema.utils);
        }
    }

    set(fileTree, `${letgoDir}/${LOW_COMPONENT_DIR}`.split('/'), components);
}
