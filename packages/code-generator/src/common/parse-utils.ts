import type {
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import { ancestorWalkAst, findGlobals, walkSchemaLogic } from '@webank/letgo-common';
import type { ClassUseCodes } from './types';

function parseMemberExpression(ancestor: any[]) {
    const len = ancestor.length - 1;
    const members: string[] = [ancestor[len].object.name, ancestor[len].property.name];
    for (let i = len - 1; i > 0; i--) {
        const cur = ancestor[i];
        if (!cur || cur.type !== 'MemberExpression')
            break;
        members.push(cur.property.name);
    }

    return members;
}

function formatApplyVariables(applyUtils: Record<string, string[][]>) {
    const usedUtils: Record<string, string[]> = {};
    for (const name of Object.keys(applyUtils)) {
        const useMembers = new Set<string>();
        for (const member of applyUtils[name]) {
            if (member.length === 0) {
                // 说明用了全导出
                useMembers.clear();
                break;
            }
            else {
                useMembers.add(member[1]);
            }
        }

        usedUtils[name] = Array.from(useMembers);
    }

    return usedUtils;
}

export function parseUseUtils(rootSchema: IPublicTypeRootSchema) {
    const applyUtils: Record<string, string[][]> = {};
    walkSchemaLogic(rootSchema, (code: string, _, type) => {
        try {
            if (!code)
                return;

            code = type === 'JSExpression' ? `(${code})` : code;
            ancestorWalkAst(code, {
                MemberExpression: (node: any, _state: any, ancestor: any[]) => {
                    if (node.object.type === 'Identifier' && node.object.name === '$utils') {
                        const members = parseMemberExpression(ancestor);
                        if (!applyUtils[members[1]])
                            applyUtils[members[1]] = [members.slice(2)];
                        else
                            applyUtils[members[1]].push(members.slice(2));
                    }
                },
            });
        }
        catch (_) {
        }
    });

    return formatApplyVariables(applyUtils);
}

export function parseUseVariables(rootSchema: IPublicTypeRootSchema, classUseCodes: ClassUseCodes) {
    const useVariables = new Set<string>([].concat(classUseCodes.$globalCode, classUseCodes.$pageCode));
    walkSchemaLogic(rootSchema, (code: string, _, type) => {
        try {
            if (code) {
                code = type === 'JSExpression' ? `(${code})` : code;
                const globalNodes = findGlobals(code);
                globalNodes.forEach((item) => {
                    useVariables.add(item.name);
                });
            }
        }
        catch (_) {
        }
    });

    return useVariables;
}
