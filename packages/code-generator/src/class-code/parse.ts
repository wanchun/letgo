import { ancestorWalkAst, parseToAst } from '@webank/letgo-common';
import type { ICodeItem } from '@webank/letgo-types';
import type { ClassUseCodes } from '../common/types';
import { logError } from '../common/log';

function getExpressionMembers(ancestor: any[]): {
    members: string[];
    sibling: string[];
} {
    const len = ancestor.length - 1;
    const members = [ancestor[len].property.name];
    for (let i = len - 1; i > 0; i--) {
        const cur = ancestor[i];
        if (!cur || cur.type !== 'MemberExpression')
            break;
        members.push(cur.property.name);
    }

    const sibling: string[] = [];
    // 处理解构表达式
    if (members.length === 1 && ancestor[len - 1].type === 'VariableDeclarator') {
        for (const id of ancestor[len - 1].id.properties) {
            if (id.key)
                sibling.push(id.key.name);
        }
    }

    return {
        members,
        sibling,
    };
}

const LIFE_CYCLE = ['onBeforeMount', 'onBeforeUnmount', 'onMounted', 'onUnmounted'];

export function parseCode(code: string, refs: Set<string>, pageCodeMap: Map<string, ICodeItem>, globalCodeMap: Map<string, ICodeItem> = new Map()) {
    const classLifeCycle: string[] = [];
    const usedCode: ClassUseCodes = {
        $refs: [],
        $globalCode: [],
        $pageCode: [],
    };

    if (!code) {
        return {
            classLifeCycle,
            usedCode,
        };
    }

    usedCode.$globalCode.push('$utils', '$context');
    const ast = parseToAst(code);

    const mainClassAst = ast.body.find((item) => {
        return item.type === 'ClassDeclaration' && item.id.name === 'Main';
    });

    if (!mainClassAst)
        throw new Error('not found Main class');

    ancestorWalkAst(ast, {
        MemberExpression: (node: any, _state: any, ancestor: any[]) => {
            const propName = node.property.name;
            if (['$pageCode', '$globalCode', '$refs'].includes(propName)) {
                const { sibling, members } = getExpressionMembers(ancestor);
                if (members[1])
                    usedCode[propName as keyof typeof usedCode].push(members[1]);
                else
                    usedCode[propName as keyof typeof usedCode].push(...sibling);
            }
        },

    });

    // 只在 Main class 找生命周期方法
    ancestorWalkAst(mainClassAst, {
        MethodDefinition: (node: any, _state: any) => {
            if (node.kind === 'method' && LIFE_CYCLE.includes(node.key.name))
                classLifeCycle.push(node.key.name);
        },
    });

    const noExistsRefs = usedCode.$refs.filter((refName) => {
        return !refs.has(refName);
    });
    usedCode.$refs = usedCode.$refs.filter((refName) => {
        return refs.has(refName);
    });
    if (noExistsRefs.length) {
        logError(
            `[ classCode ]： 中使用了未定义的 $refs 变量: ${noExistsRefs.join(', ')}`,
        );
    }

    const noExitsPageCodes = usedCode.$pageCode.filter((codeId) => {
        return !pageCodeMap.has(codeId);
    });
    usedCode.$pageCode = usedCode.$pageCode.filter((codeId) => {
        return pageCodeMap.has(codeId);
    });
    if (noExitsPageCodes.length) {
        logError(
            `[ classCode ]： 中使用了未定义的 $pageCode 变量: ${noExitsPageCodes.join(', ')}`,
        );
    }

    const noExitsGlobalCodes = usedCode.$globalCode.filter((codeId) => {
        return !codeId.startsWith('$') && !globalCodeMap.has(codeId);
    });
    usedCode.$globalCode = usedCode.$globalCode.filter((codeId) => {
        return codeId.startsWith('$') || globalCodeMap.has(codeId);
    });

    if (noExitsGlobalCodes.length) {
        logError(
            `[ classCode ]： 中使用了未定义的 $globalCode 变量: ${noExitsGlobalCodes.join(', ')}`,
        );
    }

    return {
        classLifeCycle,
        usedCode,
    };
}
