import type { CSSProperties, PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { css } from '@codemirror/lang-css';
import { CodeMirror } from '../../../component';
import { parseToCssCode, parseToStyleData } from '../../../common';

export const CodeView = defineComponent({
    props: {
        value: {
            type: Object as PropType<CSSProperties>,
        },
        onStyleChange: Function as PropType<(style: CSSProperties, assign: boolean) => void>,
    },
    setup(props) {
        const code = computed(() => {
            return parseToCssCode(props.value);
        });

        const onStyleChange = (code: string) => {
            const styleData = parseToStyleData(code);
            if (styleData)
                props.onStyleChange?.(styleData, false);
        };

        return () => {
            return (
                <CodeMirror
                    modelValue={code.value}
                    onUpdate:modelValue={onStyleChange}
                    basic={true}
                    tabSize={4}
                    extensions={[css()]}
                />
            );
        };
    },
});
