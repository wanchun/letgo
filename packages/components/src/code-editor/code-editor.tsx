import type {
    PropType,
    StyleValue,
} from 'vue';
import {
    defineComponent,
    nextTick,
    onMounted,
    ref, watch,
} from 'vue';
import { basicSetup } from 'codemirror';
import type { ViewUpdate } from '@codemirror/view';
import {
    EditorView,
    placeholder,
} from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import {
    EditorState,
} from '@codemirror/state';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { FullScreen } from '@icon-park/vue-next';
import { FDrawer } from '@fesjs/fes-design';
import type { DocumentModel } from '@harrywan/letgo-designer';
import { autocompletion } from '@codemirror/autocomplete';
import { HintTheme, hintPlugin } from './hint';
import { useHint } from './use';
import { fullScreenIconCls, fullScreenWrapperCls, wrapCls } from './code-editor.css';

export const CodeEditor = defineComponent({
    props: {
        documentModel: Object as PropType<DocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        doc: String,
        changeDoc: Function as PropType<(doc: string) => void>,
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
    },
    setup(props, { attrs }) {
        const editorRefEl = ref<HTMLElement>();
        const fullScreenRef = ref<HTMLElement>();
        const isFullScreen = ref(false);

        let currentDoc = props.doc || '';
        let editorView: EditorView;
        let fullScreenView: EditorView;

        const { hintOptions } = useHint(props);

        const theme = EditorView.theme({
            ...HintTheme,
        });

        const genState = (state = true) => {
            return EditorState.create({
                doc: currentDoc,
                extensions: [
                    basicSetup,
                    theme,
                    ...props.extensions,
                    javascriptLanguage.data.of({
                        autocomplete: hintPlugin(hintOptions),
                    }),
                    autocompletion({
                        icons: false,
                    }),
                    placeholder('Type your code here'),
                    state && EditorView.updateListener.of((v: ViewUpdate) => {
                        if (v.docChanged) {
                            currentDoc = v.state.sliceDoc();
                            props.changeDoc(currentDoc);
                        }
                    })].filter(Boolean),
            });
        };

        onMounted(() => {
            editorView = new EditorView({
                state: genState(),
                parent: editorRefEl.value,
            });
        });

        watch(() => props.doc, () => {
            if (props.doc !== currentDoc) {
                currentDoc = props.doc;
                editorView?.setState(genState());
                fullScreenView?.setState(genState());
            }
        });

        const toggleFullScreen = () => {
            if (!props.fullscreen)
                return;

            isFullScreen.value = !isFullScreen.value;
            if (isFullScreen.value) {
                editorView?.setState(genState(false));
                fullScreenView?.setState(genState());
                nextTick(() => {
                    if (!fullScreenView) {
                        fullScreenView = new EditorView({
                            state: genState(),
                            parent: fullScreenRef.value,
                        });
                    }
                });
            }
            else {
                fullScreenView?.setState(genState(false));
                editorView?.setState(genState());
            }
        };

        return () => {
            return (
                <>
                    <div
                        ref={editorRefEl}
                        class={[attrs.class, wrapCls, props.bordered && 'is-bordered']}
                        style={attrs.style as StyleValue}
                    >
                        {props.fullscreen && (
                            <FullScreen
                                class={fullScreenIconCls}
                                size={14}
                                theme="outline"
                                onClick={toggleFullScreen}
                            >
                            </FullScreen>
                        )}
                    </div>
                    {props.fullscreen && (
                        <FDrawer
                            show={isFullScreen.value}
                            title="代码编辑"
                            width={800}
                            contentClass={fullScreenWrapperCls}
                            onCancel={toggleFullScreen}
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
