import type { ComputedRef } from 'vue';
import { watch } from 'vue';
import type { CodeItem, CodeStruct } from '@webank/letgo-types';
import { CodeType } from '@webank/letgo-types';
import { calcDependencies, sortState } from '@webank/letgo-common';
import { TemporaryStateLive } from './temporary-state';
import { ComputedLive } from './computed';
import type { JavascriptQueryBase } from './query/base';
import { createQueryImpl } from './query';
import { JavascriptFunctionLive } from './javascript-function';

export type CodeImplType = ComputedLive | TemporaryStateLive | JavascriptQueryBase | JavascriptFunctionLive;

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
    executeCtx,
    onSet,
    onClear,
}: {
    codeStruct: ComputedRef<CodeStruct>
    executeCtx: Record<string, any>
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
            instance = new TemporaryStateLive(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_COMPUTED)
            instance = new ComputedLive(item, dependencyMap.get(item.id), ctx);

        else if (item.type === CodeType.JAVASCRIPT_QUERY)
            instance = createQueryImpl(item, dependencyMap.get(item.id), ctx);
        else if (item.type === CodeType.JAVASCRIPT_FUNCTION)
            instance = new JavascriptFunctionLive(item, dependencyMap.get(item.id), ctx);

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
        initCodesInstance(executeCtx);
    }, {
        immediate: true,
    });
}
