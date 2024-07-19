import type { PropType } from 'vue';
import { defineComponent, watch } from 'vue';
import type { Monaco } from '@monaco-editor/loader';

import { MonacoEditor } from './editor';

import './expression-editor.less';

export const MonacoExpressionEditor = defineComponent({
    props: {
        value: String,
        onChange: Function as PropType<(input: string, event: any) => void>,
        libs: Array as PropType<{ path: string; content: string }[]>,
    },
    setup(props) {
        let currentMonaco: Monaco;
        const editorDidMount = (monaco: Monaco) => {
            currentMonaco = monaco;
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
                noSuggestionDiagnostics: true,
            });

            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                allowJs: true,
                typeRoots: ['node_modules/@types'],
            });

            if (props.libs?.length) {
                props.libs.forEach((lib) => {
                    currentMonaco.languages.typescript.javascriptDefaults.addExtraLib(
                        lib.content,
                        `ts:${lib.path}`,
                    );
                });
            }
        };

        watch(() => props.libs, () => {
            if (currentMonaco && props.libs?.length) {
                props.libs.forEach((lib) => {
                    currentMonaco.languages.typescript.javascriptDefaults.addExtraLib(
                        lib.content,
                        `ts:${lib.path}`,
                    );
                });
            }
        });

        return () => {
            return (
                <MonacoEditor
                    height="20px"
                    className="letgo-comp-monaco-ex"
                    options={{
                        fixedOverflowWidgets: true,
                        glyphMargin: false,
                        lineNumbers: 'off',
                        folding: false,
                        contextmenu: false,
                        wordWrap: 'off',
                        lineNumbersMinChars: 0,
                        overviewRulerLanes: 0,
                        overviewRulerBorder: false,
                        renderLineHighlight: false,
                        lineDecorationsWidth: 0,
                        hideCursorInOverviewRuler: true,
                        scrollBeyondLastColumn: 0,
                        scrollbar: { horizontal: 'hidden', vertical: 'hidden' },
                        find: { addExtraSpaceOnTop: false, autoFindInSelection: 'never', seedSearchStringFromSelection: false },
                        minimap: { enabled: false },
                    }}
                    language="javascript"
                    bordered
                    value={props.value}
                    onChange={props.onChange}
                    editorDidMount={editorDidMount}
                />
            );
        };
    },
});
