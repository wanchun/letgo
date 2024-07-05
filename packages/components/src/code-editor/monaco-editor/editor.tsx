import type { IDisposable } from 'monaco-editor';
import { FullScreenTwo, OffScreenTwo } from '@icon-park/vue-next';
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import {
    SingleMonacoEditorProps,
    WORD_EDITOR_INITIALIZING,
    useEditor,
} from './helper';

import './index.less';

export const MonacoEditor = defineComponent({
    props: SingleMonacoEditorProps,
    setup(props) {
        const {
            isEditorReady,
            isLoading,
            containerRef,
            monacoEditor,
        } = useEditor('single', props);

        let subscription: IDisposable;
        watch(isEditorReady, () => {
            if (isEditorReady.value) {
                subscription?.dispose();
                subscription = monacoEditor.value?.onDidChangeModelContent((event: any) => {
                    const editorValue = monacoEditor.value?.getModel().getValue();

                    if (props.value !== editorValue)
                        props.onChange(editorValue, event);
                });
            }
        });

        const innerStyle = computed(() => {
            return {
                width: props.width,
                height: props.height,
            };
        });

        const isFullScreen = ref(false);
        const fullScreenStyle = ref({});
        const toggleFullScreen = () => {
            if (!props.fullScreen)
                return;

            if (!isFullScreen.value) {
                isFullScreen.value = true;
                fullScreenStyle.value = {
                    width: 'auto',
                    height: 'auto',
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9998,
                };
                // 更新小地图配置
                monacoEditor.value?.updateOptions({
                    ...monacoEditor.value?.getOptions(),
                    minimap: {
                        enabled: true,
                    },
                });
                monacoEditor.value?.layout();
            }
            else {
                isFullScreen.value = false;
                monacoEditor.value?.updateOptions({
                    ...monacoEditor.value?.getOptions(),
                    minimap: {
                        enabled: false,
                    },
                });
                monacoEditor.value?.layout();
            }
        };

        const renderFullScreen = () => {
            if (isFullScreen.value) {
                return (
                    <OffScreenTwo
                        class="letgo-comp-monaco__screen-icon letgo-comp-monaco__off-screen-icon"
                        size={15}
                        theme="outline"
                        onClick={toggleFullScreen}
                    >
                    </OffScreenTwo>
                );
            }

            return (
                <FullScreenTwo
                    class="letgo-comp-monaco__screen-icon"
                    size={15}
                    theme="outline"
                    onClick={toggleFullScreen}
                >
                </FullScreenTwo>
            );
        };

        onUnmounted(() => {
            subscription?.dispose();
            monacoEditor.value?.getModel()?.dispose();
            monacoEditor.value?.dispose();
        });

        return () => {
            return (
                <div class={[props.className, 'letgo-comp-monaco']}>
                    {isLoading.value && <span class="letgo-comp-monaco__loading">{WORD_EDITOR_INITIALIZING}</span>}
                    <div
                        ref={containerRef}
                        class="letgo-comp-monaco__container"
                        style={isFullScreen.value ? fullScreenStyle.value : innerStyle.value}
                    >
                        {props.fullScreen && renderFullScreen() }
                    </div>
                </div>

            );
        };
    },
});
