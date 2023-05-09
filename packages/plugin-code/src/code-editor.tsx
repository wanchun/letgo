import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { placeholder } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';
import type { PropType } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { editorCls } from './code-editor.css';

export default defineComponent({
    props: {
        doc: String,
        changeDoc: Function as PropType<(doc: string) => void>,
    },
    setup(props) {
        const editorRefEl = ref();
        let currentDoc = props.doc || '';
        let editorView: EditorView;

        const genState = () => {
            return EditorState.create({
                doc: props.doc,
                extensions: [
                    basicSetup,
                    javascript(),
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
