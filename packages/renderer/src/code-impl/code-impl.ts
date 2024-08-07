import type { ComputedRef } from 'vue';
import { watch } from 'vue';
import type { ICodeItem, ICodeStruct } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { calcDependencies, genCodeMap, sortState } from '@webank/letgo-common';
import config from '../config';
import { TemporaryStateLive } from './temporary-state';
import { ComputedLive } from './computed';
import type { JavascriptQueryBase } from './query/base';
import { createQueryImpl } from './query';
import { JavascriptFunctionLive } from './javascript-function';
import { LifecycleHookLive } from './lifecycle-hook';

export type CodeImplType = ComputedLive | TemporaryStateLive | JavascriptQueryBase | JavascriptFunctionLive | LifecycleHookLive;

export function useCodesInstance({
    codeStruct,
    executeCtx,
    onSet,
    onClear,
}: {
    codeStruct: ComputedRef<ICodeStruct>;
    executeCtx: Record<string, any>;
    onSet: (key: string, value: CodeImplType) => void;
    onClear: (keys: string[]) => void;
}) {
    const codeMap = new Map<string, ICodeItem>();
    const dependencyMap = new Map<string, string[]>();

    const createCodeInstance = (item: ICodeItem, ctx: Record<string, any>) => {
        if (!dependencyMap.has(item.id))
            dependencyMap.set(item.id, calcDependencies(item, ctx));

        let instance: CodeImplType;
        if (item.type === IEnumCodeType.TEMPORARY_STATE)
            instance = new TemporaryStateLive(item, dependencyMap.get(item.id), ctx);

        else if (item.type === IEnumCodeType.JAVASCRIPT_COMPUTED)
            instance = new ComputedLive(item, dependencyMap.get(item.id), ctx);

        else if (item.type === IEnumCodeType.JAVASCRIPT_QUERY)
            instance = createQueryImpl(item, dependencyMap.get(item.id), ctx);

        else if (item.type === IEnumCodeType.JAVASCRIPT_FUNCTION)
            instance = new JavascriptFunctionLive(item, dependencyMap.get(item.id), ctx);

        else if (item.type === IEnumCodeType.LIFECYCLE_HOOK)
            instance = new LifecycleHookLive(item, dependencyMap.get(item.id), ctx);

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
                // eslint-disable-next-line no-alert
                window.alert(err.message);
            else
                config.logError(err);
        }
    };

    watch(codeStruct, () => {
        initCodesInstance(executeCtx);
    }, {
        immediate: true,
    });
}
