import { EditorView, minimalSetup } from 'codemirror';
import { defineComponent, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue';
import { Annotation, EditorState } from '@codemirror/state';
import type { Diagnostic } from '@codemirror/lint';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { autocompletion } from '@codemirror/autocomplete';
import type { ViewUpdate } from '@codemirror/view';
import {
    keymap,
    placeholder,
} from '@codemirror/view';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';
import type { PropType } from 'vue';
import { isFunction } from 'lodash-es';
import { useEventListener } from '@vueuse/core';
import { HintTheme, hintPlugin, useHint, useScopeVariables } from './use-hint';
import { useOxcWorker } from './use-oxc';

import './expression-editor.less';

const External = Annotation.define<boolean>();

function formatExpression(expression: string) {
    if (!expression)
        return expression;

    let result: string = expression.trim();
    if (result.startsWith(';'))
        result = result.slice(1);
    if (result.endsWith(';'))
        result = result.slice(0, -1);

    if (result.startsWith('(') && result.endsWith(')'))
        return result.slice(1, -1);

    return result;
}

function formatDiagnostics(diagnostics: Diagnostic[] = [], doc: string = '') {
    if (!doc.trim())
        return [];
    // 加两个括号的长度
    const len = doc.length + 2;
    return diagnostics.map(diagnostic => ({
        ...diagnostic,
        from: diagnostic.from ? diagnostic.from - 1 : diagnostic.from,
        to: diagnostic.to ? (diagnostic.to === len ? diagnostic.to - 2 : diagnostic.to - 1) : diagnostic.to,
    })).filter(diagnostic => diagnostic.from <= diagnostic.to && diagnostic.to !== 0);
}

export const ExpressionEditor = defineComponent({
    props: {
        documentModel: Object as PropType<IPublicModelDocumentModel>,
        hints: Object as PropType<Record<string, any>>,
        doc: String,
        onInput: Function as PropType<(doc: string) => void>,
        onChange: Function as PropType<(doc: string) => void>, // blur、组件卸载、页面刷新才会调用
        onBlur: Function as PropType<(doc: string) => void>,
        onFocus: Function as PropType<(doc: string) => void>,
        placeholder: String,
        compRef: String,
        id: String,
    },
    setup(props, { expose }) {
        const editorRefEl = ref();
        let editorView: EditorView;

        const scopeVariables = useScopeVariables(props);
        const { hintOptions } = useHint(scopeVariables);
        const { updateCode, oxcOutput } = useOxcWorker(toRef(() => props.id));

        const Theme = EditorView.theme({
            '&': {
                borderRadius: '4px',
                border: '1px solid #cfd0d3',
            },
            '&.cm-focused': {
                outline: '0',
                border: '1px solid #52c41a',
            },
            '& .cm-gutters': {
                borderRight: 0,
                display: 'none',
            },
            ...HintTheme,
        });
        let currentDoc = props.doc;
        watch(oxcOutput, () => {
            if (oxcOutput.value && editorView) {
                editorView.dispatch(
                    setDiagnostics(editorView.state, formatDiagnostics(oxcOutput.value.diagnostics || [], currentDoc)),
                );
            }
        });

        const innerOnInput = (doc: string) => {
            currentDoc = doc;
            updateCode(`(${doc})`);
            if (isFunction(props.onInput))
                props.onInput(doc);
        };

        const genState = () => {
            return EditorState.create({
                doc: props.doc,
                extensions: [
                    minimalSetup,
                    keymap.of([
                        ...vscodeKeymap,
                    ]),
                    Theme,
                    placeholder(props.placeholder || '表达式'),
                    autocompletion({
                        override: [hintPlugin(hintOptions)],
                        compareCompletions(a, b) {
                            // 如果 a 以 $ 开头而 b 不是，a 排在后面
                            if (a.label.startsWith('.$') && !b.label.startsWith('.$'))
                                return 1;
                            // 如果 b 以 $ 开头而 a 不是，a 排在前面
                            if (!a.label.startsWith('.$') && b.label.startsWith('.$'))
                                return -1;

                            return a.label.localeCompare(b.label);
                        },
                        icons: false,
                    }),
                    lintGutter(),
                    EditorView.updateListener.of((v: ViewUpdate) => {
                        if (v.docChanged && !v.transactions.some(tr => tr.annotation(External))) {
                            const doc = v.state.doc.toString();
                            innerOnInput(doc);
                        }
                    }),
                ],
            });
        };

        const innerFocus = () => {
            const doc = editorView.state.sliceDoc();
            if (props.onFocus)
                props.onFocus(doc);
        };

        const innerGetFormattedCode = () => {
            const doc = editorView.state.sliceDoc();
            return oxcOutput.value?.diagnostics?.some(item => item.severity === 'error') ? doc : (formatExpression(oxcOutput.value?.formatter) || doc);
        };

        const innerOnBlur = () => {
            const doc = innerGetFormattedCode();
            if (doc !== props.doc && isFunction(props.onChange))
                props.onChange(doc);
            if (isFunction(props.onBlur))
                props.onBlur(doc);
        };

        onMounted(() => {
            editorView = new EditorView({
                state: genState(),
                parent: editorRefEl.value,
            });
            editorView.dom.addEventListener('focus', innerFocus, true);
            editorView.dom.addEventListener('blur', innerOnBlur, true);
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

        const onLeaving = () => {
            const doc = innerGetFormattedCode();
            if (doc !== props.doc && props.onChange)
                props.onChange(doc);
        };

        useEventListener(window, 'beforeunload', onLeaving);

        onBeforeUnmount(() => {
            onLeaving();
            editorView?.dom.removeEventListener('focus', innerFocus, true);
            editorView?.dom.removeEventListener('blur', innerOnBlur, true);
            editorView?.destroy();
        });

        expose({
            getFormattedCode: innerGetFormattedCode,
        });

        return () => {
            return <div class="letgo-expression-edit" ref={editorRefEl}></div>;
        };
    },
});
