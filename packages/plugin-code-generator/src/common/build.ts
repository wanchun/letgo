import { ImportType } from './types';
import type { FileStruct } from './types';
import { genImportCode } from './helper';

export function toAssemble(fileStruct: FileStruct) {
    fileStruct.importSources.push({
        source: 'vue',
        type: ImportType.ImportSpecifier,
        imported: 'defineComponent',
    });
    return `
        ${genImportCode(fileStruct.importSources)}

        ${fileStruct.afterImports.join('\n')}
        
        export default defineComponent({
            name: '${fileStruct.routeName}',
            setup() {
                ${fileStruct.codes.join('\n')}

                ${fileStruct.jsx}
            }
        });
    `;
}
