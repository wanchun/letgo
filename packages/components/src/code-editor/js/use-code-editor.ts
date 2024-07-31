import { autocompletion } from '@codemirror/autocomplete';
import { deleteLine, indentWithTab } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import {
    Annotation,
    Compartment,
    EditorState,
} from '@codemirror/state';
import {
    EditorView,
    keymap,
    lineNumbers,
    placeholder,
} from '@codemirror/view';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import { isFunction } from 'lodash-es';
import { nextTick, onBeforeUnmount, ref, toRef, watch } from 'vue';
import type { CodeEditorProps } from '../types';
import { HintTheme, hintPlugin, useHint, useScopeVariables } from './use-hint';
import { useOxcWorker } from './use-oxc';

const External = Annotation.define<boolean>();

export function useCodeEditor(props: CodeEditorProps) {
    const container = ref<HTMLElement>();

    let editorView: EditorView;

    const scopeVariables = useScopeVariables(props);
    const { hintOptions } = useHint(scopeVariables);
    const { updateCode, oxcOutput, getFormatCode } = useOxcWorker(toRef(() => props.id));

    const theme = EditorView.theme({
        ...HintTheme,
        ...props.theme,
        '&': {
            height: props.height,
            outline: 'none',
        },
    });

    let currentDoc = props.doc || '';
    watch(oxcOutput, () => {
        if (oxcOutput.value && editorView) {
            if (currentDoc.trim()) {
                editorView.dispatch(
                    setDiagnostics(editorView.state, oxcOutput.value.diagnostics),
                );
            }
            else {
                editorView.dispatch(setDiagnostics(editorView.state, []));
            }
        }
    });

    const innerOnChange = (doc: string) => {
        currentDoc = doc;
        updateCode(doc);
        if (isFunction(props.onChange))
            props.onChange(doc);
    };

    const gutter = new Compartment();
    const lines = lineNumbers();

    function toggleLineNumber(visible: boolean) {
        if (visible) {
            editorView.dispatch({
                effects: gutter.reconfigure([lines]),
            });
        }
        else {
            editorView.dispatch({
                effects: gutter.reconfigure([]),
            });
        }
    }

    const isFullScreen = ref(false);
    function toggleFullScreen() {
        if (!props.fullscreen)
            return;

        if (!isFullScreen.value) {
            isFullScreen.value = true;
            toggleLineNumber(true);
            nextTick(() => {
                editorView?.focus();
            });
        }
        else {
            isFullScreen.value = false;
            toggleLineNumber(props.lineNumbers);
        }
    };

    const genState = () => {
        return EditorState.create({
            doc: props.doc,
            extensions: [
                basicSetup({
                    lineNumbers: false,
                }),
                gutter.of(props.lineNumbers ? [lines] : []),
                keymap.of([
                    ...vscodeKeymap,
                    indentWithTab,
                    {
                        key: 'Delete',
                        shift: deleteLine,
                    },
                ]),
                theme,
                javascript(),
                ...props.extensions,
                javascriptLanguage.data.of({
                    autocomplete: hintPlugin(hintOptions),
                }),
                autocompletion({
                    icons: false,
                    compareCompletions(a, b) {
                        // 如果 a 以 $ 开头而 b 不是，a 排在后面
                        if (a.label.startsWith('.$') && !b.label.startsWith('.$'))
                            return 1;
                        // 如果 b 以 $ 开头而 a 不是，a 排在前面
                        if (!a.label.startsWith('.$') && b.label.startsWith('.$'))
                            return -1;

                        return a.label.localeCompare(b.label);
                    },
                }),
                lintGutter(),
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
        const formatCode = getFormatCode();
        const updateCoded = formatCode ?? doc;

        if (isFunction(props.onBlur))
            props.onBlur(updateCoded);
    };

    watch(container, () => {
        if (container.value && !editorView) {
            currentDoc = props.doc || '';
            editorView = new EditorView({
                state: genState(),
                parent: container.value,
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
        containerRef: container,
        isFullScreen,
        toggleFullScreen,
        getFormatCode: (id?: string) => {
            return getFormatCode(id) || editorView?.state.sliceDoc();
        },
    };
}
