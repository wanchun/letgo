import type { IPublicTypeComponentSchema, IPublicTypeUtils } from '@webank/letgo-types';
import { ImportType } from '../common/types';
import type { FileStruct } from '../common/types';
import { genImportCode } from '../common/helper';
import { genComponentName } from './file-name';
import { genProps } from './gen-props';
import { genUtils } from './gen-utils';

export function fileStructToLowcodeComponent(fileStruct: FileStruct, rootSchema: IPublicTypeComponentSchema, utils: IPublicTypeUtils) {
    const { code, importSources } = genUtils(utils, rootSchema);

    fileStruct.importSources.push({
        source: 'vue',
        type: ImportType.ImportSpecifier,
        imported: 'defineComponent',
    }, ...importSources);
    const compName = genComponentName(fileStruct.fileName);

    return `
        ${genImportCode(fileStruct.importSources)}

        ${fileStruct.afterImports.join('\n')}
        
        ${code}

        export const ${compName} = defineComponent({
            name: '${compName}',
            props: {
                ${genProps(rootSchema)}
            },
            setup(props) {
                ${fileStruct.codes.join('\n')}

                ${fileStruct.jsx}
            }
        });
    `;
}
