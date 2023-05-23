import { provide, reactive, ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { CODE_INJECTION_KEY } from '../constants';
import type { CodeItem, CodeStruct, CodeType } from '../interface';
import { codeTypeEdit } from './code-type';
import { useCodeInstance } from './code-impl/code-impl';

function genCodeMap(code: CodeStruct) {
    const codeMap = new Map<string, CodeItem>();

    code.code.forEach((item) => {
        codeMap.set(item.id, item);
    });

    code.directories.forEach((directory) => {
        directory.code.forEach((item) => {
            codeMap.set(item.id, item);
        });
    });

    return codeMap;
}

function useCode() {
    const code: CodeStruct = reactive({
        directories: [],
        code: [],
    });

    const codeMap = genCodeMap(code);
    const {
        codeInstances,
        createCodeInstance,
        deleteCodeInstance,
        changeCodeInstance,
        changeCodeInstanceId,
    } = useCodeInstance(codeMap);

    const hasCodeId = (id: string) => {
        return codeMap.has(id);
    };

    const changeCodeId = (id: string, preId: string) => {
        const item = codeMap.get(preId);
        if (item) {
            // TODO 所有 deps 依赖了该 code 的都需要变
            item.id = id;
            codeMap.delete(preId);
            codeMap.set(id, item);

            changeCodeInstanceId(id, preId);
        }
    };
    const genCodeId = (type: CodeType) => {
        const reg = new RegExp(`^${type}(\\d+)$`);
        let idSuffix = 0;
        for (const key of codeMap.keys()) {
            const matchResult = key.match(reg);
            if (matchResult && Number(matchResult[1]) > idSuffix)
                idSuffix = Number(matchResult[1]);
        }
        return `${type}${idSuffix + 1}`;
    };

    const addCodeItem = (type: CodeType) => {
        const id = genCodeId(type);
        const item = codeTypeEdit[type].addCode(id);

        code.code.push(item);
        codeMap.set(id, code.code[code.code.length - 1]);

        createCodeInstance(code.code[code.code.length - 1]);
    };

    const deleteCodeItem = (id: string) => {
        const index = code.code.findIndex(item => item.id === id);
        if (index !== -1) {
            codeMap.delete(id);
            code.code.splice(index, 1);
        }
        else {
            for (const directory of code.directories) {
                for (const [index, item] of directory.code.entries()) {
                    if (item.id === id) {
                        codeMap.delete(id);
                        directory.code.splice(index, 1);
                        return;
                    }
                }
            }
        }

        deleteCodeInstance(id);
    };

    const changeCodeItemContent = (id: string, content: Record<string, any>) => {
        const item = codeMap.get(id);
        Object.assign(item, content);

        changeCodeInstance(id, content);
    };

    const currentCodeItem = ref<CodeItem>();
    const changeCurrentCodeItem = (item: CodeItem) => {
        currentCodeItem.value = item;
    };

    provide(CODE_INJECTION_KEY, {
        hasCodeId,
    });

    return {
        codeInstances,

        code,
        changeCodeId,
        addCodeItem,
        deleteCodeItem,

        currentCodeItem,
        changeCurrentCodeItem,

        changeCodeItemContent,
    };
}

export default createSharedComposable(useCode);
