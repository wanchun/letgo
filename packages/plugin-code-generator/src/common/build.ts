import { ImportType, isJsxFile, isVueFile } from './types';
import type { FileStruct } from './types';
import { genImportCode } from './helper';

export function toAssemble(fileStruct: FileStruct) {
    if (isVueFile(fileStruct)) {
        return `
            ${fileStruct.template!}

            <script setup>
            ${genImportCode(fileStruct.importSources)}

            ${fileStruct.afterImports.join('\n')}

            ${fileStruct.codes.join('\n')}
            </script>
        `;
    }
    else if (isJsxFile(fileStruct)) {
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
    return '';
}
