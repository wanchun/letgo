import type { PageMeta, SetupCode } from './types';
import { ImportType } from './types';

let pageFlag = 1;

export function formatFileName(fileName?: string) {
    if (!fileName)
        return `page-${pageFlag++}.vue`;
    if (fileName.endsWith('.vue'))
        return fileName;

    return `${fileName}.vue`;
}

export function formatPageName(fileName: string) {
    return fileName.replace('.vue', '');
}

let titleFlag = 1;
export function formatPageTitle(title: string) {
    return title || `菜单${titleFlag++}`;
}

export function genPageMetaCode(meta: PageMeta): SetupCode {
    return {
        importSources: [{
            imported: 'defineRouteMeta',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes',
        }],
        code: `defineRouteMeta({
            name: '${meta.name}',
            title: '${meta.title}',
        })`,
    };
}
