import type { IPublicTypeRootSchema } from '@webank/letgo-types';
import { ImportType } from '../common/types';
import type { FileStruct } from '../common/types';
import { genImportCode } from '../common/helper';
import { genComponentName } from './file-name';
import { genProps } from './gen-props';

export function fileStructToString(fileStruct: FileStruct, rootSchema: IPublicTypeRootSchema) {
    fileStruct.importSources.push({
        source: 'vue',
        type: ImportType.ImportSpecifier,
        imported: 'defineComponent',
    });
    const compName = genComponentName(fileStruct.fileName);

    return `
        ${genImportCode(fileStruct.importSources)}

        ${fileStruct.afterImports.join('\n')}
        
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
