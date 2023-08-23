import { cloneDeep } from 'lodash-es';
import { exportZip } from '../export-zip';
import { ImportType } from '../common/types';
import { genFileName } from '../common/page-meta';
import { toAssemble } from '../common/build';
import type { FileStruct, GlobalStateCode } from '../common/types';

const defaultObjectConfig = `
import { defineBuildConfig } from '@fesjs/fes';

export default defineBuildConfig({
    proxy: {
        '/rcs-mas': {
            target: process.env.TEST_HOST,
            secure: false,
            changeOrigin: true,
        },
    },
});
`;

export async function genFesCode(fileStructs: FileStruct[], globalState?: GlobalStateCode, globalCss?: string) {
    const defaultContent = await import('./template.json');
    const currentContent = cloneDeep(defaultContent.default);

    const pages = fileStructs.reduce((acc, cur) => {
        cur.importSources.unshift({
            imported: 'defineRouteMeta',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes',
        });
        cur.afterImports.push(`defineRouteMeta({
            name: '${cur.routeName}',
            title: '${cur.pageTitle}',
        })`);
        acc[genFileName(cur)] = toAssemble(cur);
        return acc;
    }, {} as Record<string, any>);

    currentContent.src.pages = Object.assign(currentContent.src.pages, pages);

    if (globalState)
        (currentContent.src.use as Record<string, string>)[globalState.filename] = globalState.content;

    if (globalCss) {
        currentContent.src['global.less'] = `
        ${currentContent.src['global.less']}
        ${globalCss}
        `;
    }

    currentContent['.fes.js'] = defaultObjectConfig;

    exportZip(currentContent);
}
