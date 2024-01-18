import { computed } from 'vue';
import { capitalize, get, isObject } from 'lodash-es';
import { getVarType } from '@webank/letgo-common';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';

import type { CompletionContext } from '@codemirror/autocomplete';
import { snippetCompletion } from '@codemirror/autocomplete';
import type { ComputedRef } from 'vue';
import type { HintPathType } from './types';

export const HintTheme = {
    '& .cm-tooltip-autocomplete': {
        border: '1px solid #cfd0d3',
        borderRadius: '4px',
        backgroundColor: '#fff',
    },
    '& .cm-tooltip-autocomplete > ul': {
        borderRadius: '4px',
        overflow: 'hidden',
    },
    '& .cm-tooltip-autocomplete > ul > li': {
        display: 'flex',
        justifyContent: 'space-between',
    },
    '& .cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: '#5384ff',
    },
    '& .cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionMatchedText': {
        color: '#fff',
    },
    '& .cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail': {
        color: '#d9d9d9',
    },
    '& .cm-tooltip-autocomplete > ul > li:hover:not([aria-selected])': {
        backgroundColor: '#f0fbff',
    },
    '& .cm-completionDetail': {
        fontStyle: 'normal',
        color: '#8c8c8c',
    },
    '.cm-completionMatchedText': {
        color: '#222',
        textDecoration: 'none',
    },
    '& .cm-gutter-lint': {
        width: '1.2em',
    },
    '& .cm-gutter-lint .cm-gutterElement': {
        padding: '0',
    },
};

export function hintPlugin(hintPaths: ComputedRef<HintPathType[]>) {
    return (context: CompletionContext) => {
        // 匹配当前输入前面的所有非空字符
        const word = context.matchBefore(/\S*/);

        // 判断如果为空，则返回null
        if (!word || (word.from === word.to && !context.explicit))
            return null;

        // 获取最后一个字符
        const latestChar = word.text[word.text.length - 1];
        const path = word.text;

        if (!path)
            return null;

        // 下面返回提示的数组一共有三种情况

        // 第一种：得到的字符串中没有.，并且最后一个输入的字符不是点。
        //       直接把定义提示数组的所有根节点返回

        // 第二种：字符串有.，并且最后一个输入的字符不是点。
        //       首先用.分割字符串得到字符串数组，把最后一个数组元素删除，然后遍历数组，根据路径获取当前对象的children，然后格式化返回。
        //       这里返回值里面的from字段有个坑，form其实就是你当前需要匹配字段的开始位置，假设你输入user.na,实际上这个form是n的位置，
        //       to是a的位置，所以我这里给form处理了一下

        // 第三种：最后一个输入的字符是点
        //       和第二种情况处理方法差不多，区别就是不用删除数组最后一个元素，并且格式化的时候，需要给label前面补上.,然后才能匹配上。

        if (!path.includes('.')) {
            return {
                from: word.from,
                options: hintPaths.value.map((item: any) => {
                    const label = `${item.label}`;
                    return snippetCompletion(label, {
                        label,
                        detail: item.detail,
                        type: item.type,
                    });
                }) || [],
            };
        }
        else if (path.includes('.')) {
            const paths = path.split('.').filter(o => o);
            const obj = hintPaths.value.find((o: any) => o.label === paths[0]);
            if (!obj || !paths.length)
                return null;

            let goBackChatLength = 1;
            if (latestChar !== '.') {
                const cur = paths.pop();
                goBackChatLength = cur.length;
            }
            let value = obj.value;
            if (paths.length > 1)
                value = get(value, paths.slice(1).join('.'));

            if (isObject(value)) {
                return {
                    from: word.to - goBackChatLength,
                    to: word.to,
                    options: Object.keys(value).map((key) => {
                        const label = latestChar === '.' ? `.${key}` : key;
                        return snippetCompletion(label, {
                            label,
                            detail: getVarType(value[key]),
                            type: 'property',
                        });
                    }) || [],
                };
            }
            return null;
        }
        return null;
    };
}

export function useScopeVariables(props: {
    scopeVariables?: Record<string, any>
    compRef?: string
    documentModel?: IPublicModelDocumentModel
}) {
    const innerScopeVariables = computed(() => {
        if (props.scopeVariables) {
            return props.scopeVariables;
        }
        else if (props.documentModel) {
            const currentDocument = props.documentModel;
            const state = currentDocument.state;
            const scope = props.compRef ? currentDocument.state.getCompScope(props.compRef) : {};
            return {
                codesInstance: Object.assign({}, state?.codesInstance, currentDocument.project.codesInstance),
                componentsInstance: state?.componentsInstance,
                scope,
                ...currentDocument.project.extraGlobalState,
            };
        }
        else {
            return {};
        }
    });
    return innerScopeVariables;
}

export function useHint(scopeVariables: ComputedRef<Record<string, any>>) {
    const hintOptions = computed(() => {
        const { codesInstance, componentsInstance, scope, ...otherState } = scopeVariables.value;
        const result: HintPathType[] = [];
        Object.keys(codesInstance || {}).forEach((key) => {
            result.push({
                label: key,
                detail: capitalize(codesInstance[key].type),
                type: 'variable',
                value: codesInstance[key].hint || codesInstance[key].view,
            });
        });
        Object.keys(scope || {}).forEach((key) => {
            result.push({
                label: key,
                detail: 'Scope',
                type: 'variable',
                value: scope[key],
            });
        });

        Object.keys(componentsInstance || {}).forEach((key) => {
            result.push({
                label: key,
                detail: 'Component',
                type: 'variable',
                value: componentsInstance[key],
            });
        });

        Object.keys(otherState).forEach((key) => {
            result.push({
                label: key,
                detail: getVarType(otherState[key as keyof typeof otherState]),
                type: 'variable',
                value: otherState[key as keyof typeof otherState],
            });
        });

        return result;
    });

    return {
        hintOptions,
    };
}
