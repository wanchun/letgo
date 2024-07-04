let pageFlag = 1;

export function formatFileName(fileName?: string) {
    if (!fileName)
        return `page-${pageFlag++}`;

    return fileName.startsWith('/') ? fileName.slice(1) : `${fileName}`;
}

export function formatPageName(fileName: string) {
    const arr = fileName.split('/');
    return arr[arr.length - 1].replace('.vue', '');
}

let titleFlag = 1;
export function formatPageTitle(title: string) {
    return title || `菜单${titleFlag++}`;
}

export function genPageEntry(fileName: string, hasClassCode: boolean = false) {
    if (hasClassCode)
        return `${fileName}/index.jsx`;

    return `${fileName}.jsx`;
}
