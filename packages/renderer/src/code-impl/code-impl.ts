import type { ComputedRef } from 'vue';
import { watch } from 'vue';
import type { CodeItem, CodeStruct } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';
import type { CodeImplType } from '@webank/letgo-designer';
import { calcDependencies, sortState } from '@webank/letgo-common';
import { TemporaryStateImpl } from './temporary-state';
import { ComputedImpl } from './computed';
import { JavascriptQueryImpl } from './javascript-query';
import { JavascriptFunctionImpl } from './javascript-function';

function genCodeMap(code: CodeStruct, codeMap: Map<string, CodeItem>) {
    code.code.forEach((item) => {
        codeMap.set(item.id, item);
    });

    code.directories.forEach((directory) => {
        directory.code.forEach((item) => {
            codeMap.set(item.id, item);
        });
    });
}

export function useCodesInstance({
    codeStruct,
    onSet,
    onClear,
}: {
    codeStruct: ComputedRef<CodeStruct>
    onSet: (key: string, value: CodeImplType) => void
    onClear: (keys: string[]) => void
}) {
    const codeMap = new Map<string, CodeItem>();
    const dependencyMap = new Map<string, string[]>();

    const createCodeInstance = (item: CodeItem, ctx: Record<string, any>) => {
        if (!dependencyMap.has(item.id))
            dependencyMap.set(item.id, calcDependencies(item, ctx));

        let instance: CodeImplType;
        if (item.type === CodeType.TEMPORARY_STATE)
            instance = new TemporaryStateImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
            instance = new ComputedImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_QUERY)
            instance = new JavascriptQueryImpl(item, dependencyMap.get(item.id), ctx);
        else if (item.type === CodeType.JAVASCRIPT_FUNCTION)
            instance = new JavascriptFunctionImpl(item, dependencyMap.get(item.id), ctx);

        if (instance)
            onSet(item.id, instance);
    };

    const initCodesInstance = (ctx: Record<string, any>) => {
        try {
            if (!codeStruct.value)
                return;
            onClear(Array.from(codeMap.keys()));
            codeMap.clear();
            genCodeMap(codeStruct.value, codeMap);

            dependencyMap.clear();
            const sortResult = sortState(codeMap, dependencyMap, ctx);
            sortResult.forEach((codeId) => {
                const item = codeMap.get(codeId);
                createCodeInstance(item, ctx);
            });
        }
        catch (err) {
            if (err instanceof Error)
                window.alert(err.message);
            else
                console.error(err);
        }
    };

    watch(codeStruct, () => {
        initCodesInstance({});
    }, {
        immediate: true,
    });
}
