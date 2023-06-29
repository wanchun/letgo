import type { FileStruct } from './types';
import { isVueFile } from './types';

let pageFlag = 1;

export function formatFileName(fileName?: string) {
    if (!fileName)
        return `page-${pageFlag++}`;

    return `${fileName}`;
}

export function formatPageName(fileName: string) {
    return fileName.replace('.vue', '');
}

let titleFlag = 1;
export function formatPageTitle(title: string) {
    return title || `菜单${titleFlag++}`;
}

export function genFileName(fileStruct: FileStruct) {
    if (isVueFile(fileStruct))
        return `${fileStruct.filename}.vue`;

    return `${fileStruct.filename}.jsx`;
}
