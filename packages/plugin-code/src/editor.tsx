import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import type { ViewUpdate } from '@codemirror/view';
import { defineComponent, onMounted, ref } from 'vue';
import { editorCls } from './editor.css';

export default defineComponent({
    props: {
        content: String,
    },
    setup() {
        const editorRefEl = ref();
        onMounted(() => {
            // eslint-disable-next-line no-new
            new EditorView({
                state: EditorState.create({
                    doc: 'console.log(\'hello\')\n',
                    extensions: [
                        basicSetup, javascript(),
                        EditorView.updateListener.of((v: ViewUpdate) => {
                            if (v.docChanged)
                                console.log(v.state.sliceDoc());
                        })],
                }),
                parent: editorRefEl.value,
            });
        });

        return () => {
            return <div class={editorCls} ref={editorRefEl}></div>;
        };
    },
});
