import type { CSSProperties, PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import { css } from '@codemirror/lang-css';
import { CodeMirror } from '@webank/letgo-components';
import { parseToCssCode, parseToStyleData } from '../../../common';

export const CodeView = defineComponent({
    props: {
        value: {
            type: Object as PropType<CSSProperties>,
        },
        onStyleChange: Function as PropType<(style: CSSProperties, assign: boolean) => void>,
    },
    setup(props) {
        const isFocus = ref(false);

        const initValue = ref(parseToCssCode(props.value));

        const currentValue = computed(() => {
            return isFocus.value ? initValue.value : parseToCssCode(props.value);
        });

        const onStyleChange = (code: string) => {
            const styleData = parseToStyleData(code);
            if (styleData)
                props.onStyleChange?.(styleData, false);
        };

        const onFocus = () => {
            isFocus.value = true;
        };

        const onBlur = () => {
            isFocus.value = false;
            initValue.value = parseToCssCode(props.value);
        };

        return () => {
            return (
                <CodeMirror
                    doc={currentValue.value}
                    changeDoc={onStyleChange}
                    extensions={[css()]}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            );
        };
    },
});
