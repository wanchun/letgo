import { useEventListener } from '@vueuse/core';
import type { ComputedRef } from 'vue';
import { onBeforeUnmount, ref } from 'vue';

export function useCodeSave(options: {
    code: ComputedRef<string>;
    save: (code: string) => void;
}) {
    const codeEditorRef = ref();

    const onLeaving = () => {
        const doc = codeEditorRef.value?.getFormatCode();
        if (doc !== options.code.value)
            options.save(doc);
    };
    onBeforeUnmount(onLeaving);

    const onBlur = (value: string) => {
        if (value !== options.code.value)
            options.save(value);
    };

    useEventListener(window, 'beforeunload', onLeaving);

    return {
        onBlur,
        codeEditorRef,
    };
}
