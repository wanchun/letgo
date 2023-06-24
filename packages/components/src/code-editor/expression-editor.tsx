import { EditorView, minimalSetup } from 'codemirror';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import type { DocumentModel } from '@webank/letgo-designer';
import { autocompletion } from '@codemirror/autocomplete';
import type { ViewUpdate } from '@codemirror/view';
import type { PropType } from 'vue';
import { editorCls } from './index.css';
import { hintPlugin } from './hint';
import { useHint } from './use';

export const ExpressionEditor = defineComponent({
    props: {
        documentModel: Object as PropType<DocumentModel>,
        doc: String,
        onChangeDoc: Function as PropType<(doc: string) => void>,
    },
    setup(props) {
        const editorRefEl = ref();
        let currentDoc = props.doc || '';
        let editorView: EditorView;

        const { hintOptions } = useHint(props);

        const genState = () => {
            return EditorState.create({
                doc: props.doc,
                extensions: [
                    minimalSetup,
                    EditorState.transactionFilter.of((tr) => {
                        return tr.newDoc.lines > 1 ? [] : [tr];
                    }),
                    autocompletion({
                        override: [hintPlugin(hintOptions)],
                    }),
                    EditorView.updateListener.of((v: ViewUpdate) => {
                        if (v.docChanged) {
                            currentDoc = v.state.sliceDoc();
                            props.onChangeDoc(currentDoc);
                        }
                    })],
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

        return () => {
            return <div class={editorCls} ref={editorRefEl}></div>;
        };
    },
});
