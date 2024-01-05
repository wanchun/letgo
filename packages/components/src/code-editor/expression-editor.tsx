import { EditorView, minimalSetup } from 'codemirror';
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import type { ViewUpdate } from '@codemirror/view';
import {
    placeholder,
} from '@codemirror/view';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';
import type { PropType } from 'vue';
import { HintTheme, hintPlugin } from './hint';
import { useHint } from './use';
import './expression-editor.less';

export const ExpressionEditor = defineComponent({
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        doc: String,
        onChangeDoc: Function as PropType<(doc: string) => void>,
        placeholder: String,
    },
    emits: ['blur', 'focus'],
    setup(props, { emit }) {
        const editorRefEl = ref();
        let currentDoc = props.doc || '';
        let editorView: EditorView;

        const { hintOptions } = useHint(props);

        const Theme = EditorView.theme({
            '&': {
                borderRadius: '4px',
                border: '1px solid #cfd0d3',
            },
            '&.cm-focused': {
                outline: '0',
                border: '1px solid #52c41a',
            },
            '& .cm-gutters': {
                borderRight: 0,
            },
            ...HintTheme,
        });

        const genState = () => {
            return EditorState.create({
                doc: props.doc,
                extensions: [
                    minimalSetup,
                    Theme,
                    placeholder(props.placeholder || '表达式'),
                    autocompletion({
                        override: [hintPlugin(hintOptions)],
                        icons: false,
                    }),
                    EditorView.updateListener.of((v: ViewUpdate) => {
                        if (v.docChanged) {
                            currentDoc = v.state.sliceDoc();
                            props.onChangeDoc(currentDoc);
                        }
                        // focus state change
                        if (v.focusChanged) {
                            currentDoc = v.state.sliceDoc();
                            if (v.view.hasFocus)
                                emit('focus', currentDoc);

                            else
                                emit('blur', currentDoc);
                        }
                    }),
                ],
            });
        };
        onMounted(() => {
            editorView = new EditorView({
                state: genState(),
                parent: editorRefEl.value,
            });
        });

        watch(() => props.doc, () => {
            if (editorView && props.doc !== currentDoc) {
                currentDoc = props.doc;
                const state = genState();
                editorView.setState(state);
            }
        });

        onBeforeUnmount(() => {
            editorView?.destroy();
        });

        return () => {
            return <div class="letgo-expression-edit" ref={editorRefEl}></div>;
        };
    },
});
