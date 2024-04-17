import type { IPublicTypeNpmInfo, IPublicTypeRootSchema, IPublicTypeUtilsMap } from '@webank/letgo-types';
import { parseUseUtils } from '../common/parse-utils';
import type { ImportSource } from '../common/types';
import { ImportType } from '../common/types';

function compilerNpmImports(npm: IPublicTypeNpmInfo): ImportSource {
    return {
        source: npm.package,
        imported: npm.exportName,
        type: npm.assembling ? ImportType.ImportAll : (npm.destructuring ? ImportType.ImportSpecifier : ImportType.ImportDefaultSpecifier),
    };
}

function genUtilsImports(utils: IPublicTypeUtilsMap, useUtils: Record<string, string[]>): ImportSource[] {
    const importSources: ImportSource[] = [];
    for (const item of utils) {
        if (item.type !== 'function') {
            const utilsMembers = useUtils[item.name];
            if (utilsMembers) {
                if (utilsMembers.length === 0 || !item.content.assembling)
                    importSources.push(compilerNpmImports(item.content));

                utilsMembers.forEach((member) => {
                    importSources.push({
                        source: item.content.package,
                        imported: member,
                        type: ImportType.ImportSpecifier,
                    });
                });
            }
        }
    }

    return importSources;
}

export function compilerUtils(utils: IPublicTypeUtilsMap = [], useUtils: Record<string, string[]>) {
    const importSources = genUtilsImports(utils, useUtils);
    const code = utils.map((item) => {
        if (item.type === 'function')
            return `${item.name}: ${item.content.value}`;

        const utilsMembers = useUtils[item.name];
        if (!utilsMembers)
            return null;

        if (utilsMembers.length === 0 || !item.content.assembling)
            return item.name;

        return `
        ${item.name}: {
            ${utilsMembers.map((member) => {
                return member;
            }).join(',\n')}
        }
        `;
    }).filter(Boolean).join(',');

    return {
        code: `
    const utils = {
        ${code}
    };
        `,
        importSources,
    };
}

export function genUtils(utils: IPublicTypeUtilsMap, schema: IPublicTypeRootSchema) {
    const useUtils = parseUseUtils(schema);
    return compilerUtils(utils, useUtils);
}
