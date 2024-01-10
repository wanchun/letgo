import { onBeforeUnmount, ref, watch } from 'vue';
import { basicSetup } from 'codemirror';
import {
    Annotation,
    EditorState,
} from '@codemirror/state';
import {
    EditorView,
    keymap,
    placeholder,
} from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import type { Diagnostic as CodeMirrorDiagnostic } from '@codemirror/lint';
import { json } from '@codemirror/lang-json';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { githubDark } from '@ddietr/codemirror-themes/github-dark';
import { deleteLine, indentWithTab } from '@codemirror/commands';
import type { Diagnostic as BiomeDiagnostic } from '@biomejs/wasm-web';
import { isFunction } from 'lodash-es';
import { HintTheme, hintPlugin, useHint, useScopeVariables } from './use-hint';
import type { CodeEditorProps } from './types';
import { useBiomeWorker } from './use-worker';

const External = Annotation.define<boolean>();

function getDiagnosticMessage(diagnostic: BiomeDiagnostic): string {
    let buf = '';
    for (const elem of diagnostic.message)
        buf += elem.content;

    return buf;
}

function biomeDiagnosticsToCodeMirror(
    biome: BiomeDiagnostic[],
): CodeMirrorDiagnostic[] {
    const codeMirror: CodeMirrorDiagnostic[] = [];

    for (const diag of biome) {
        const span = diag.location?.span;
        if (span === undefined)
            continue;

        let severity: CodeMirrorDiagnostic['severity'];
        switch (diag.severity) {
            case 'error':
            case 'fatal': {
                severity = 'error';
                break;
            }

            case 'information': {
                severity = 'info';
                break;
            }

            case 'warning': {
                severity = 'warning';
                break;
            }

            default: {
                severity = 'error';
            }
        }

        codeMirror.push({
            from: span[0],
            to: span[1],
            severity,
            message: getDiagnosticMessage(diag),
        });
    }

    return codeMirror;
}

export function useCodeMirror(props: CodeEditorProps) {
    const container = ref<HTMLElement>();

    let editorView: EditorView;

    const scopeVariables = useScopeVariables(props);
    const { hintOptions } = useHint(scopeVariables);
    const { biomeOutput } = useBiomeWorker(props, scopeVariables);

    const theme = EditorView.theme({
        ...HintTheme,
        '&': {
            height: props.height,
            outline: 'none',
        },
    });

    watch(biomeOutput, () => {
        editorView.dispatch(
            setDiagnostics(editorView.state, biomeDiagnosticsToCodeMirror(biomeOutput.value.diagnostics.list)),
        );
    });

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
                props.language === 'json' ? json() : javascript(),
                githubDark,
                ...props.extensions,
                javascriptLanguage.data.of({
                    autocomplete: hintPlugin(hintOptions),
                }),
                autocompletion({
                    icons: false,
                }),
                lintGutter(),
                placeholder('Enter your code here'),
                EditorView.updateListener.of(async (v) => {
                    if (v.docChanged && isFunction(props.onChange) && !v.transactions.some(tr => tr.annotation(External))) {
                        const doc = v.state.doc.toString();
                        props.onChange(doc);
                    }
                    // focus state change
                    if (v.focusChanged) {
                        const doc = v.state.sliceDoc();
                        if (v.view.hasFocus && isFunction(props.onFocus))
                            props.onFocus(doc);

                        if (!v.view.hasFocus && isFunction(props.onBlur))
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
