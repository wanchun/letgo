import type { CSSProperties, PropType } from 'vue';
import { defineComponent, ref, watch } from 'vue';
import { MonacoEditor } from '@webank/letgo-components';
import { debounce } from 'lodash-es';
import { engineConfig } from '@webank/letgo-editor-core';
import { parseToCssCode, parseToStyleData } from '../../../common';

export const CodeView = defineComponent({
    props: {
        value: {
            type: Object as PropType<CSSProperties>,
        },
        onStyleChange: Function as PropType<(style: CSSProperties, assign: boolean) => void>,
    },
    setup(props) {
        const initValue = ref(parseToCssCode(props.value));

        watch(() => props.value, () => {
            initValue.value = parseToCssCode(props.value);
        });

        const monacoEditorRef = ref();
        const onChange = debounce((value: string) => {
            try {
                if (!monacoEditorRef.value.isSyntaxError()) {
                    const styleData = parseToStyleData(value);
                    if (styleData)
                        props.onStyleChange?.(styleData, false);
                }
            }
            catch (_) {
                console.warn(_);
            }
        }, 500);

        const requireConfig = ref();
        engineConfig.onGot('requireConfig', (config: Record<string, any>) => {
            requireConfig.value = config;
        });

        return () => {
            return (
                <MonacoEditor
                    ref={monacoEditorRef}
                    requireConfig={requireConfig.value}
                    options={{
                        fixedOverflowWidgets: true,
                        glyphMargin: false,
                        lineNumbers: 'off',
                        contextmenu: false,
                    }}
                    language="css"
                    height="150px"
                    value={initValue.value}
                    onChange={onChange}
                    bordered
                    fullscreen
                />
            );
        };
    },
});
