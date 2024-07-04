import type { IDisposable } from 'monaco-editor';
import { FullScreen } from '@icon-park/vue-next';
import { PropType, defineComponent, onUnmounted, ref, watch } from 'vue';
import { Monaco } from '@monaco-editor/loader';
import type {
    ISingleMonacoEditorProps,
} from './helper';
import {
    SingleMonacoEditorProps,
    useEditor,
} from './helper';

export const MonacoEditor = defineComponent({
    props: SingleMonacoEditorProps,
    setup(props) {
        const {
            isEditorReady,
            containerRef,
            monacoEditor,
        } = useEditor('single', props);

        let subscription: IDisposable;
        watch(isEditorReady, () => {
            if (isEditorReady.value) {
                subscription?.dispose();
                subscription = monacoEditor?.onDidChangeModelContent((event: any) => {
                    const editorValue = monacoEditor?.getModel().getValue();

                    if (props.value !== editorValue)
                        props.onChange(editorValue, event);
                });
            }
        });

        const isFullScreen = ref(false);

        const toggleFullScreen = () => {
            if (!props.fullScreen)
                return;

            isFullScreen.value = !isFullScreen.value;
        };

        onUnmounted(() => {
            subscription?.dispose();
            monacoEditor?.getModel()?.dispose();
            monacoEditor?.dispose();
        });

        return () => {
            return (
                <div
                    ref={containerRef}
                    class={[props.className, 'letgo-comp-code', props.bordered && 'is-bordered']}
                >
                    {props.fullScreen && (
                        <FullScreen
                            class="letgo-comp-code__full-icon"
                            size={14}
                            theme="outline"
                            onClick={toggleFullScreen}
                        >
                        </FullScreen>
                    )}
                </div>
            );
        };
    },
});
