import type { Monaco } from '@monaco-editor/loader';
import type { editor as oEditor } from 'monaco-editor';
import { ref, shallowRef, toRef, watch } from 'vue';
import type { CSSProperties, ExtractPublicPropTypes, PropType } from 'vue';
import { usePrevious } from '@vueuse/core';
import { getMonaco } from './monaco';

// @todo fill type def for monaco editor without refering monaco editor
/**
 * @see https://microsoft.github.io/monaco-editor/api/index.html
 */
export type IEditorInstance = oEditor.IStandaloneCodeEditor;
export type { Monaco } from '@monaco-editor/loader';

export type EditorEnhancer =
  (monaco: Monaco, editorIns: IEditorInstance) => any;

export const GeneralMonacoEditorProps = {
    /** [Monaco editor options](https://microsoft.github.io/monaco-editor/) */
    options: {
        type: Object as PropType<Record<string, any>>,
        default(): Record<string, any> {
            return {};
        },
    },
    /** callback after monaco's loaded and after editor's loaded */
    editorDidMount: {
        type: Function as PropType<(monaco: Monaco, editor: IEditorInstance) => void>,
    },
    /** callback after monaco's loaded and before editor's loaded */
    editorWillMount: {
        type: Function as PropType<(monaco: Monaco) => void>,
    },
    /** path of the current model, useful when creating a multi-model editor */
    path: String,
    /** whether to save the models' view states between model changes or not */
    saveViewState: Boolean,
    /** language of the editor @see https://microsoft.github.io/monaco-editor/ for available languages */
    language: String,
    /** theme of the editor, "light" | "vs-dark" */
    theme: String,
    /** [config passing to require](https://github.com/suren-atoyan/monaco-react#loader-config), can be used to upgrade monaco-editor */
    requireConfig: {
        type: Object as PropType<Record<string, any>>,
        default(): Record<string, any> {
            return {};
        },
    },
    value: String,
    defaultValue: String,
    className: String,
    width: [Number, String] as PropType<number | string>,
    height: [Number, String] as PropType<number | string>,
    enableOutline: Boolean,
    style: [String, Object] as PropType<CSSProperties>,
    overrideServices: Object as PropType<oEditor.IEditorOverrideServices>,
    enhancers: Array as PropType<EditorEnhancer[]>,
};

export const SingleMonacoEditorProps = {
    ...GeneralMonacoEditorProps,
    onChange: Function as PropType<(input: string, event: any) => void>,
    fullScreen: Boolean,
};

export type IGeneralMonacoEditorProps = ExtractPublicPropTypes<typeof GeneralMonacoEditorProps>;

export type ISingleMonacoEditorProps = ExtractPublicPropTypes<typeof SingleMonacoEditorProps>;

export interface IDiffMonacoEditorProps extends IGeneralMonacoEditorProps {
    original?: string;
}

export const WORD_EDITOR_INITIALIZING = '编辑器初始化中';

export const INITIAL_OPTIONS: oEditor.IStandaloneEditorConstructionOptions = {
    fontSize: 12,
    tabSize: 2,
    fontFamily: 'Menlo, Monaco, Courier New, monospace',
    folding: true,
    minimap: {
        enabled: false,
    },
    autoIndent: 'advanced',
    contextmenu: true,
    useTabStops: true,
    wordBasedSuggestions: 'allDocuments',
    formatOnPaste: true,
    automaticLayout: true,
    lineNumbers: 'on',
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    fixedOverflowWidgets: false,
    snippetSuggestions: 'top',
    scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
    },
};

export function useEditor(type: 'single' | 'diff', props: IGeneralMonacoEditorProps) {
    const containerRef = ref<HTMLElement>();
    const isEditorReady = ref(false);
    const isFocused = ref(false);
    const isLoading = ref(true);

    const previousPath = usePrevious(toRef(() => props.path));

    const currentMonaco = shallowRef<Monaco>();
    const currentEditor = shallowRef<oEditor.IStandaloneCodeEditor>();

    getMonaco(props.requireConfig)
        .then((monaco: Monaco) => {
            // 兼容旧版本 monaco-editor 写死 MonacoEnvironment 的问题
            (window as any).MonacoEnvironment = undefined;
            if (typeof (window as any).define === 'function' && (window as any).define.amd) {
                // make monaco-editor's loader work with webpack's umd loader
                // @see https://github.com/microsoft/monaco-editor/issues/2283
                delete (window as any).define.amd;
            }

            currentMonaco.value = monaco;
            try {
                if (props.editorWillMount)
                    props.editorWillMount(monaco);
            }
            catch (err) { }

            if (!containerRef.value)
                return;

            if (type === 'single') {
                const model = getOrCreateModel(
                    monaco,
                    props.value ?? props.defaultValue ?? '',
                    props.language,
                    props.path,
                );
                currentEditor.value = monaco.editor.create(containerRef.value, {
                    automaticLayout: true,
                    ...INITIAL_OPTIONS,
                    ...props.options,
                }, props.overrideServices);
                currentEditor.value.setModel(model);
            }

            props.enhancers?.forEach((en: any) => en(monaco, currentEditor as any));
            try {
                props.editorDidMount(monaco, currentEditor.value);
            }
            catch (err) { }
            isEditorReady.value = true;
        })
        .catch((err: unknown) => {
            console.error('Monaco Editor Load Error!', err);
        })
        .then(() => {
            isLoading.value = false;
        });

    watch(() => [isEditorReady.value, props.theme], () => {
        if (isEditorReady.value)
            currentMonaco.value.editor.setTheme(props.theme);
    });

    watch(isEditorReady, () => {
        if (!isEditorReady.value)
            return;

        currentEditor.value?.onDidFocusEditorText(() => {
            isFocused.value = true;
        });
        currentEditor.value?.onDidBlurEditorText(() => {
            isFocused.value = false;
        });
    });

    // controlled value -- diff mode / without path only
    watch(() => [props.path, props.value], () => {
        if (!isEditorReady.value)
            return;

        if (type !== 'diff' && !!props.path)
            return;

        const editor = currentEditor;

        const nextValue = props.value ?? props.defaultValue ?? '';
        if (editor.value?.getOption?.(currentMonaco.value?.editor.EditorOption.readOnly)) {
            editor.value?.setValue(nextValue);
        }
        else if (props.value !== editor.value?.getValue()) {
            editor.value?.executeEdits('', [{
                range: editor.value?.getModel().getFullModelRange(),
                text: nextValue,
                forceMoveMarkers: true,
            }]);

            editor.value?.pushUndoStop();
        }
    });

    const viewStatus = new Map<any, oEditor.ICodeEditorViewState>();
    // multi-model && controlled value (shouldn't be diff mode)
    watch(() => [props.value, props.path], () => {
        if (!isEditorReady.value)
            return;

        if (type === 'diff')
            return;

        if (props.path === previousPath.value)
            return;

        const model = getOrCreateModel(
            currentMonaco.value,
            props.value ?? props.defaultValue,
            props.language,
            props.path,
        );

        if (props.value != null && model.getValue() !== props.value)
            model.setValue(props.value);

        if (model !== currentEditor.value.getModel()) {
            props.saveViewState && viewStatus.set(previousPath, currentEditor.value.saveViewState());
            currentEditor.value.setModel(model);
            props.saveViewState && currentEditor.value.restoreViewState(viewStatus.get(props.path));
        }
    });

    return {
        isEditorReady,
        isFocused,
        isLoading,
        containerRef,
        monaco: currentMonaco,
        monacoEditor: currentEditor,
    } as const;
}

function getOrCreateModel(monaco: Monaco, value?: string, language?: string, path?: string) {
    if (path) {
        const prevModel = monaco
            .editor
            .getModel(monaco.Uri.parse(path));
        if (prevModel)
            return prevModel;
    }

    return monaco
        .editor
        .createModel(value, language, path && monaco.Uri.parse(path));
}
