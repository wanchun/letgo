import type { Extension } from '@codemirror/state';
import { FullScreenTwo } from '@icon-park/vue-next';
import { FDrawer } from '@fesjs/fes-design';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';
import type {
    PropType,
} from 'vue';
import {
    Teleport,
    computed,
    defineComponent,
    ref,
} from 'vue';
import '../code-editor.less';
import { useCodeEditor } from './use-code-editor';

export const CodeEditor = defineComponent({
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        doc: String,
        onChange: Function as PropType<(doc: string, id?: string) => void>,
        onBlur: Function as PropType<(doc: string, id?: string) => void>,
        onFocus: Function as PropType<(doc: string, id?: string) => void>,
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
        lineNumbers: {
            type: Boolean,
            default: false,
        },
        compRef: String,
        id: String,
        placeholder: String,
    },
    setup(props, { attrs }) {
        const { containerRef, isFullScreen, toggleFullScreen } = useCodeEditor(props);
        const innerStyle = computed(() => {
            if (isFullScreen.value)
                return null;
            return {
                height: props.height,
            };
        });

        const fullscreenRef = ref();

        const preventFocus = (event: MouseEvent) => {
            event.preventDefault();
        };

        const renderFullScreen = () => {
            if (isFullScreen.value)
                return null;

            return (
                <FullScreenTwo
                    class="letgo-comp-code__screen-icon"
                    size={15}
                    theme="outline"
                    onMousedown={preventFocus}
                    onClick={toggleFullScreen}
                >
                </FullScreenTwo>
            );
        };

        return () => {
            return (
                <>
                    <Teleport to={fullscreenRef.value} disabled={!fullscreenRef.value || !isFullScreen.value}>
                        <div class={['letgo-comp-code', attrs.class, props.bordered && 'is-bordered']}>
                            <div
                                ref={containerRef}
                                class={['letgo-comp-code__container', isFullScreen.value && 'letgo-comp-code__container--fullscreen']}
                                style={innerStyle.value}
                            >
                                {props.fullscreen && renderFullScreen() }
                            </div>
                        </div>
                    </Teleport>
                    {props.fullscreen && isFullScreen.value && (
                        <FDrawer
                            show={isFullScreen.value}
                            title="代码编辑"
                            dimension={800}
                            contentClass="letgo-comp-code__full-screen"
                            onCancel={toggleFullScreen}
                            maskClosable={false}
                        >
                            <div ref={fullscreenRef} style={{ height: '100%' }}>
                            </div>
                        </FDrawer>
                    )}
                </>
            );
        };
    },
});
