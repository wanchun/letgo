import { EditorView, minimalSetup } from 'codemirror';
import { capitalize } from 'lodash-es';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { getVarType } from '@webank/letgo-common';
import type { DocumentModel } from '@webank/letgo-designer';
import { autocompletion } from '@codemirror/autocomplete';
import type { ViewUpdate } from '@codemirror/view';
import type { PropType } from 'vue';
import { editorCls } from './index.css';
import type { HintPathType } from './types';
import { hintPlugin } from './hint';

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

        const hintOptions = computed(() => {
            const state = props.documentModel.state;
            const result: HintPathType[] = [];
            Object.keys(state.codesInstance || {}).forEach((key) => {
                result.push({
                    label: key,
                    detail: capitalize(state.codesInstance[key].type),
                    type: 'variable',
                    value: state.codesInstance[key].view,
                });
            });

            Object.keys(state.componentsInstance || {}).forEach((key) => {
                result.push({
                    label: key,
                    detail: 'Component',
                    type: 'variable',
                    value: state.componentsInstance[key],
                });
            });

            Object.keys(state.globalState || {}).forEach((key) => {
                result.push({
                    label: key,
                    detail: getVarType(state.globalState[key]),
                    type: 'variable',
                    value: state.globalState[key],
                });
            });

            return result;
        });

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
                const state = genState();
                editorView.setState(state);
            }
        });

        return () => {
            return <div class={editorCls} ref={editorRefEl}></div>;
        };
    },
});
