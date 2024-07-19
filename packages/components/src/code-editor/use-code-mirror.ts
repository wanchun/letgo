import { autocompletion } from '@codemirror/autocomplete';
import { deleteLine, indentWithTab } from '@codemirror/commands';
import {
    Annotation,
    EditorState,
} from '@codemirror/state';
import {
    EditorView,
    keymap,
    placeholder,
} from '@codemirror/view';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { basicSetup } from 'codemirror';
import { isFunction } from 'lodash-es';
import { onBeforeUnmount, ref, watch } from 'vue';
import type { CodeEditorProps } from './types';

const External = Annotation.define<boolean>();

export function useCodeMirror(props: CodeEditorProps, onEsc: () => void) {
    const container = ref<HTMLElement>();

    let editorView: EditorView;

    const theme = EditorView.theme({
        '&': {
            height: props.height,
            outline: 'none',
        },
        ...props.theme,
    });

    const innerOnChange = (doc: string) => {
        if (isFunction(props.onChange))
            props.onChange(doc);
    };

    const genState = () => {
        return EditorState.create({
            doc: props.doc,
            extensions: [
                basicSetup,
                keymap.of([
                    ...vscodeKeymap,
                    indentWithTab,
                    {
                        key: 'Delete',
                        shift: deleteLine,
                    },
                    {
                        key: 'Escape',
                        run: (): boolean => {
                            onEsc();
                            return false;
                        },
                    },
                ]),
                theme,
                ...props.extensions,
                autocompletion({
                    icons: false,
                }),
                placeholder(props.placeholder || 'Enter your code here'),
                EditorView.updateListener.of(async (v) => {
                    if (v.docChanged && !v.transactions.some(tr => tr.annotation(External))) {
                        const doc = v.state.doc.toString();
                        innerOnChange(doc);
                    }
                    // focus state change
                    if (v.focusChanged) {
                        const doc = v.state.sliceDoc();
                        if (v.view.hasFocus && isFunction(props.onFocus))
                            props.onFocus(doc);

                        if (!v.view.hasFocus && props.onBlur)
                            props.onBlur(doc);
                    }
                }),
            ].filter(Boolean),
        });
    };

    watch(container, () => {
        if (container.value && !editorView) {
            editorView = new EditorView({
                state: genState(),
                parent: container.value,
            });
        }
    });

    onBeforeUnmount(() => {
        editorView?.destroy();
    });

    watch(() => props.doc, (value) => {
        const currentValue = editorView ? editorView.state.doc.toString() : '';
        if (editorView && value !== currentValue) {
            editorView.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value || '' },
                annotations: [External.of(true)],
            });
        }
    });

    return [container];
}
