import type { IDisposable } from 'monaco-editor';
import { cloneDeep } from 'lodash-es';
import { FullScreenTwo, OffScreenTwo } from '@icon-park/vue-next';
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import { FModal } from '@fesjs/fes-design';
import {
    SingleMonacoEditorProps,
    WORD_EDITOR_INITIALIZING,
    useEditor,
} from './helper';

import './index.less';

export const MonacoEditor = defineComponent({
    props: SingleMonacoEditorProps,
    setup(props, { expose }) {
        const {
            isEditorReady,
            isLoading,
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

        const isFullScreen = ref(false);
        const fullScreenStyle = ref({});
        let preOptions: Record<string, any>;
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
                preOptions = cloneDeep(monacoEditor.value?.getRawOptions());
                // 更新小地图配置
                monacoEditor.value?.updateOptions({
                    lineNumbers: 'on',
                    glyphMargin: true,
                    contextmenu: true,
                    minimap: {
                        enabled: true,
                    },
                });
                monacoEditor.value?.layout();
            }
            else {
                isFullScreen.value = false;
                monacoEditor.value?.updateOptions(preOptions);
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

        expose({
            isSyntaxError() {
                const model = monacoEditor.value.getModel();

                // 获取模型中的所有标记（包括错误和警告）
                const markers = monaco.value.editor.getModelMarkers({ owner: model.getLanguageId() });
                const errors = markers.filter(marker => marker.severity === monaco.value.MarkerSeverity.Error);
                return errors.length !== 0;
            },
            async getFormatValue(silent: boolean) {
                const model = monacoEditor.value.getModel();

                // 获取模型中的所有标记（包括错误和警告）
                const markers = monaco.value.editor.getModelMarkers({ owner: model.getLanguageId() });
                const errors = markers.filter(marker => marker.severity === monaco.value.MarkerSeverity.Error);

                if (!silent && errors.length) {
                    FModal.warn({
                        title: '语法异常',
                        content: () => {
                            return (
                                <>
                                    <p style="margin: 0">当前的代码解析出错，代码内容将无法保存，请重新编辑后关闭面板以保存。</p>
                                    <pre style="margin: 0">
                                        {errors.map((error) => {
                                            return `Error at line ${error.startLineNumber}:${error.startColumn} - ${error.message}`;
                                        })}
                                    </pre>
                                </>
                            );
                        },
                    });
                    return null;
                }
                await monacoEditor.value.getAction('editor.action.formatDocument').run();
                return monacoEditor.value.getValue();
            },
        });

        return () => {
            return (
                <div class={[props.className, 'letgo-comp-monaco', isFocused.value && 'is-focused', props.bordered && 'is-bordered']}>
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
