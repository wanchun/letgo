import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import type { DocumentModel } from '@webank/letgo-designer';
import { placeholder } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';
import type { PropType } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { hintPlugin } from './hint';
import { editorCls } from './js-editor.css';
import { useHint } from './use';

// TODO: 语法校验
export const JsEditor = defineComponent({
    props: {
        documentModel: Object as PropType<DocumentModel>,
        doc: String,
        changeDoc: Function as PropType<(doc: string) => void>,
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
                    basicSetup,
                    javascript(),
                    javascriptLanguage.data.of({
                        autocomplete: hintPlugin(hintOptions),
                    }),
                    placeholder('Type your code here'),
                    EditorView.updateListener.of((v: ViewUpdate) => {
                        if (v.docChanged) {
                            currentDoc = v.state.sliceDoc();
                            props.changeDoc(currentDoc);
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
                const state = genState();
                editorView.setState(state);
            }
        });

        return () => {
            return <div class={editorCls} ref={editorRefEl}></div>;
        };
    },
});
