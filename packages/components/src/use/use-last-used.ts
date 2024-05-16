import { createGlobalState, useStorage, useUrlSearchParams } from '@vueuse/core';
import type { IPublicTypeSnippet } from '@webank/letgo-types';
import type { Ref } from 'vue';
import { computed } from 'vue';

interface UsedLog {
    name: string;
    count: number;
};

const useGlobalState = createGlobalState(key => useStorage(key, {}, localStorage));

export function useLastUsed(snippetsRef: Ref<IPublicTypeSnippet[]>, limit?: number, projectId?: string) {
    const urlParams = useUrlSearchParams('hash');
    const key = `LAST_USED_${projectId || urlParams.id as string || ''}`;
    const lastUsed: Ref<Record<string, UsedLog>> = useGlobalState(key);

    const addLastUsed = (snippet: IPublicTypeSnippet) => {
        const componentName = snippet.schema.componentName;
        let log = lastUsed.value[componentName];
        if (log)
            log.count = log.count + 1;
        else log = { name: componentName, count: 1 };
        lastUsed.value[componentName] = log;
    };

    /** 最近使用的组件 */
    const lastUsedSnippets = computed(() => {
        const usedList = Object.values(lastUsed.value).sort((a, b) => b.count - a.count);
        const snippets: IPublicTypeSnippet[] = [];
        usedList.forEach((item, index) => {
            if (limit && index < limit || !limit) {
                const founds = snippetsRef.value.filter(s => s.schema.componentName === item.name);
                if (founds?.length)
                    snippets.push(...founds);
            }
        });
        return snippets;
    });

    const clearLastUsed = () => {
        lastUsed.value = {};
    };

    return {
        lastUsedSnippets,
        addLastUsed,
        clearLastUsed,
    };
}
