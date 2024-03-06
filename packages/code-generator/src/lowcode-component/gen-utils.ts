import type { IPublicTypeProjectSchema, IPublicTypeUtilsMap } from '@webank/letgo-types';
import { parseUtils } from '../common/parse-utils';
import { ImportType } from '../common/types';

function compilerNpmImports(npm: IPublicTypeNpmInfo): ImportSource {
    return {
        source: npm.package,
        imported: npm.exportName,
        type: npm.assembling ? ImportType.ImportAll : (npm.destructuring ? ImportType.ImportSpecifier : ImportType.ImportDefaultSpecifier),
    };
}

function genUtilsImports(utils: IPublicTypeUtilsMap): ImportSource[] {
    return utils.filter(item => item.type !== 'function').map((item) => {
        return compilerNpmImports(item.content as IPublicTypeNpmInfo);
    });
}

export function compilerUtils(utils: IPublicTypeUtilsMap, applyUtils: Record<string, any>) {
    const importSources = genUtilsImports(utils);
    const code = utils.map((item) => {
        if (item.type === 'function')
            return `${item.name}: ${item.content.value}`;
        else if (applyUtils[name])
            return `${item.name}`;
    }).join(',');

    return {
        code: `
    const utils = {
        ${code}
    };
        `,
        importSources,
    };
}

export function genUtils(schema: IPublicTypeProjectSchema) {
    const applyUtils = parseUtils(schema.componentsTree[0]);
    compilerUtils(schema.utils, applyUtils);
}
