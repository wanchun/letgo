import type { FileStruct } from './types';

let pageFlag = 1;

export function formatFileName(fileName?: string) {
    if (!fileName)
        return `page-${pageFlag++}`;

    return `${fileName}`;
}

export function formatPageName(fileName: string) {
    const arr = fileName.split('/');
    return arr[arr.length - 1].replace('.vue', '');
}

let titleFlag = 1;
export function formatPageTitle(title: string) {
    return title || `菜单${titleFlag++}`;
}

export function genFileName(fileStruct: FileStruct) {
    return `${fileStruct.filename}.jsx`;
}
