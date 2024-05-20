import { createGlobalState } from '@vueuse/core';
import type { IPublicTypeProjectSchema, IPublicTypeSnippet } from '@webank/letgo-types';
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

interface UsedLog {
    name: string;
    count: number;
};

function _useLastUsedComp(project?: IPublicTypeProjectSchema) {
    const lastUsed = ref({});

    watch(() => project.id, (val) => {
        const key = `LAST_USED_${val}`;
        lastUsed.value = JSON.parse(localStorage.getItem(key));
    }, {
        immediate: true,
    });

    watch(lastUsed, () => {
        const key = `LAST_USED_${project?.id}`;
        localStorage.setItem(key, JSON.stringify(lastUsed.value));
    }, {
        deep: true,
    });

    return lastUsed;
}

const useGlobalState = createGlobalState(_useLastUsedComp);

export function useLastUsed(snippetsRef: Ref<IPublicTypeSnippet[]>, limit?: number, project?: IPublicTypeProjectSchema) {
    const lastUsed: Ref<Record<string, UsedLog>> = useGlobalState(project);

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
