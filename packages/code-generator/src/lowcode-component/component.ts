import { merge } from 'lodash-es';
import type { FileStruct, FileTree } from '../common/types';
import { compNameToFileName, genComponentName } from './file-name';

export function genComponentsEntry(filesStruct: FileStruct[], fileTree: FileTree) {
    const componentsExport: string[] = [];
    for (const fileStruct of filesStruct) {
        const fileName = compNameToFileName(fileStruct.fileName);
        const compName = genComponentName(fileStruct.fileName);
        componentsExport.push(`export { ${compName} } from './components/${fileName}'`);
    }
    merge(fileTree, {
        src: {
            'components.js': componentsExport.join(';\n'),
        },
    });
}
