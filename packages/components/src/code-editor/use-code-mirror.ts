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
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { CodeEditorProps } from './types';

const External = Annotation.define<boolean>();

export function useCodeMirror(props: CodeEditorProps) {
    const containerRef = ref<HTMLElement>();
    const isFullScreen = ref(false);

    let editorView: EditorView;

    const theme = EditorView.theme({
        '&': {
            height: props.height,
            outline: 'none',
        },
        ...props.theme,
    });

    const toggleFullScreen = () => {
        if (!props.fullscreen)
            return;

        if (!isFullScreen.value) {
            isFullScreen.value = true;
            nextTick(() => {
                editorView?.focus();
            });
        }
        else {
            isFullScreen.value = false;
        }
    };

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
                }),
            ].filter(Boolean),
        });
    };

    const innerFocus = () => {
        const doc = editorView.state.sliceDoc();
        if (props.onFocus)
            props.onFocus(doc);
    };

    const innerOnBlur = () => {
        const doc = editorView.state.sliceDoc();

        if (isFunction(props.onBlur))
            props.onBlur(doc);
    };

    watch(containerRef, () => {
        if (containerRef.value && !editorView) {
            editorView = new EditorView({
                state: genState(),
                parent: containerRef.value,
            });
            editorView.dom.addEventListener('focus', innerFocus, true);
            editorView.dom.addEventListener('blur', innerOnBlur, true);
        }
    });

    onBeforeUnmount(() => {
        editorView?.dom.removeEventListener('focus', innerFocus, true);
        editorView?.dom.removeEventListener('blur', innerOnBlur, true);
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

    return {
        containerRef,
        isFullScreen,
        toggleFullScreen,
    };
}
