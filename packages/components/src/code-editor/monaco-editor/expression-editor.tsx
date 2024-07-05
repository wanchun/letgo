import type { IDisposable } from 'monaco-editor';
import { computed, defineComponent, onUnmounted, watch } from 'vue';
import {
    SingleMonacoEditorProps,
    useEditor,
} from './helper';

import './expression-editor.less';

export const MonacoExpressionEditor = defineComponent({
    props: SingleMonacoEditorProps,
    setup(props, { expose }) {
        const {
            isEditorReady,
            isFocused,
            containerRef,
            monaco,
            monacoEditor,
        } = useEditor('single', props);

        let subscription: IDisposable;
        watch(isEditorReady, () => {
            if (isEditorReady.value) {
                subscription?.dispose();
                subscription = monacoEditor.value?.onDidChangeModelContent((event: any) => {
                    const editorValue = monacoEditor.value?.getModel().getValue();

                    if (props.value !== editorValue)
                        props.onChange?.(editorValue, event);
                });
            }
        });

        watch(isFocused, () => {
            if (isFocused.value)
                props.onFocus?.();
            else
                props.onBlur?.();
        });

        const innerStyle = computed(() => {
            return {
                width: props.width,
                height: props.height,
            };
        });

        onUnmounted(() => {
            subscription?.dispose();
            monacoEditor.value?.getModel()?.dispose();
            monacoEditor.value?.dispose();
        });

        expose({
            isSyntaxError() {
                const model = monacoEditor.value.getModel();

                // 获取模型中的所有标记（包括错误和警告）
                const markers = monaco.value.editor.getModelMarkers({ owner: model.getLanguageId() });
                const errors = markers.filter(marker => marker.severity === monaco.value.MarkerSeverity.Error);
                return errors.length !== 0;
            },
        });

        return () => {
            return (
                <div class={[props.className, isFocused.value && 'is-focused', 'letgo-comp-monaco-ex']}>
                    <div
                        ref={containerRef}
                        class="letgo-comp-monaco-ex__container"
                        style={innerStyle.value}
                    >
                    </div>
                </div>
            );
        };
    },
});
