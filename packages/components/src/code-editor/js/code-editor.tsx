import type { Extension } from '@codemirror/state';
import { FullScreenTwo, OffScreenTwo } from '@icon-park/vue-next';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';
import type {
    PropType,
} from 'vue';
import {
    Teleport,
    computed,
    defineComponent,
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
        const { containerRef, isFullScreen, fullScreenStyle, toggleFullScreen } = useCodeEditor(props);
        const innerStyle = computed(() => {
            return {
                height: props.height,
            };
        });

        const preventFocus = (event: MouseEvent) => {
            event.preventDefault();
        };

        const renderFullScreen = () => {
            if (isFullScreen.value) {
                return (
                    <OffScreenTwo
                        class="letgo-comp-code__screen-icon letgo-comp-code__off-screen-icon"
                        size={15}
                        theme="outline"
                        onMousedown={preventFocus}
                        onClick={toggleFullScreen}
                    >
                    </OffScreenTwo>
                );
            }

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
                <Teleport to="body" disabled={!isFullScreen.value}>
                    <div class={['letgo-comp-code', attrs.class, props.bordered && 'is-bordered']}>
                        <div
                            ref={containerRef}
                            class={['letgo-comp-code__container', isFullScreen.value && 'letgo-comp-code__container--fullscreen']}
                            style={isFullScreen.value ? fullScreenStyle.value : innerStyle.value}
                        >
                            {props.fullscreen && renderFullScreen() }
                        </div>
                    </div>
                </Teleport>
            );
        };
    },
});
