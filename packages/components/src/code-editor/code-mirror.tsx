import type { Extension } from '@codemirror/state';
import { FDrawer } from '@fesjs/fes-design';
import { FullScreen } from '@icon-park/vue-next';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';
import type {
    PropType,
    StyleValue,
} from 'vue';
import {
    defineComponent,
    ref,
} from 'vue';
import './code-editor.less';
import { useCodeMirror } from './use-code-mirror';

export const CodeMirror = defineComponent({
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        doc: String,
        onChange: Function as PropType<(doc: string) => void>,
        onBlur: Function as PropType<(doc: string) => void>,
        onFocus: Function as PropType<(doc: string) => void>,
        extensions: {
            type: Array as PropType<Extension[]>,
            default: () => {
                return [] as Extension[];
            },
        },
        bordered: {
            type: Boolean,
            default: true,
        },
        fullscreen: {
            type: Boolean,
            default: true,
        },
        theme: {
            type: Object,
            default: () => ({}),
        },
        height: {
            type: String,
            default: '100px',
        },
        placeholder: String,
    },
    setup(props, { attrs }) {
        const [editorRefEl] = useCodeMirror(props);
        const [fullScreenRef] = useCodeMirror(props);
        const isFullScreen = ref(false);

        const toggleFullScreen = () => {
            if (!props.fullscreen)
                return;

            isFullScreen.value = !isFullScreen.value;
        };

        return () => {
            return (
                <>
                    <div
                        ref={editorRefEl}
                        class={[attrs.class, 'letgo-comp-code', props.bordered && 'is-bordered']}
                        style={attrs.style as StyleValue}
                    >
                        {props.fullscreen && (
                            <FullScreen
                                class="letgo-comp-code__full-icon"
                                size={14}
                                theme="outline"
                                onClick={toggleFullScreen}
                            >
                            </FullScreen>
                        )}
                    </div>
                    {props.fullscreen && (isFullScreen.value || fullScreenRef.value) && (
                        <FDrawer
                            show={isFullScreen.value}
                            title="代码编辑"
                            width={800}
                            contentClass="letgo-comp-code__full-screen"
                            onCancel={toggleFullScreen}
                            maskClosable={false}
                        >
                            <div ref={fullScreenRef} style={{ height: '100%' }}>
                            </div>
                        </FDrawer>
                    )}
                </>
            );
        };
    },
});
