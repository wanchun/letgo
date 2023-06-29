import { type FileStruct, isVueFile } from './types';

import { genImportCode } from './helper';

export function toAssemble(fileStruct: FileStruct) {
    if (isVueFile(fileStruct)) {
        return `
            ${fileStruct.template!}

            <script setup>
            ${genImportCode(fileStruct.importSources)}

            ${fileStruct.codes.join('\n')}
            </script>
        `;
    }
    return '';
}
