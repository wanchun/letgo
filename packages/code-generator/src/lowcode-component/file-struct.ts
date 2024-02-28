import { ImportType } from '../common/types';
import type { FileStruct } from '../common/types';
import { genImportCode } from '../common/helper';
import { genComponentName } from './file-name';

export function fileStructToString(fileStruct: FileStruct) {
    fileStruct.importSources.push({
        source: 'vue',
        type: ImportType.ImportSpecifier,
        imported: 'defineComponent',
    });
    const compName = genComponentName(fileStruct.filename);
    return `
        ${genImportCode(fileStruct.importSources)}

        ${fileStruct.afterImports.join('\n')}
        
        export const ${compName} = defineComponent({
            name: '${compName}',
            setup() {
                ${fileStruct.codes.join('\n')}

                ${fileStruct.jsx}
            }
        });
    `;
}
