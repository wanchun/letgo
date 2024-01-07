import { basicSetup } from 'codemirror';
import { Decoration, EditorView, keymap } from '@codemirror/view';
import {
    Compartment,
    EditorSelection,
    EditorState,
    RangeSet,
    StateEffect,
    StateField,
} from '@codemirror/state';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { json, jsonLanguage } from '@codemirror/lang-json';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { githubDark } from '@ddietr/codemirror-themes/github-dark';
import { lintGutter, linter } from '@codemirror/lint';
import { language, syntaxTree } from '@codemirror/language';
import { autocompletion } from '@codemirror/autocomplete';
import { deleteLine, indentWithTab } from '@codemirror/commands';

import initWasm, { Oxc, OxcFormatterOptions, OxcLinterOptions, OxcParserOptions, OxcRunOptions } from '@oxc/wasm-web';

class Playground {
    oxc;

    runOptions;
    parserOptions;
    formatterOptions;
    linterOptions;

    editor;
    languageConf;
    linterConf;

    constructor() {
        this.languageConf = new Compartment();
        this.linterConf = new Compartment();
        this.editor = this.initEditor();
    }

    initOxc() {
        this.oxc = new Oxc();
        this.runOptions = new OxcRunOptions();
        this.parserOptions = new OxcParserOptions();
        this.formatterOptions = new OxcFormatterOptions();
        this.linterOptions = new OxcLinterOptions();

        this.runOptions.syntax = true;
        this.runOptions.lint = true;

        this.runOxc(this.editor.state.doc.toString());
        this.editor.dispatch({ effects: this.linterConf.reconfigure(this.linter()) });
    }

    linter() {
        return linter(() => this.updateDiagnostics(), { delay: 0 });
    }

    runOxc(text) {
        const sourceText = text;
        this.oxc.sourceText = sourceText;
    }

    initEditor() {
        const stateListener = EditorView.updateListener.of((view) => {
            if (view.docChanged)
                this.runOxc(view.state.doc.toString());
        });

        const state = EditorState.create({
            extensions: [
                basicSetup,
                EditorView.lineWrapping,
                keymap.of([
                    ...vscodeKeymap,
                    indentWithTab,
                    {
                        key: 'Delete',
                        shift: deleteLine,
                    },
                ]),
                javascript(),
                githubDark,
                lintGutter(),
                stateListener,
                autocompletion(),
                this.linterConf.of(this.linter()),
            ],
            doc: placeholderText,
        });

        return new EditorView({
            state,
            parent: document.querySelector('#editor'),
        });
    }

    updateDiagnostics() {
        const diagnostics = (this.oxc ? this.oxc.getDiagnostics() : []).map(d => ({
            from: d.start,
            to: d.end,
            severity: d.severity.toLowerCase(),
            message: d.message,
        }));
        return diagnostics;
    }

    run() {
        this.oxc.run(
            this.runOptions,
            this.parserOptions,
            this.linterOptions,
            this.formatterOptions,
        );
    }

    static highlightMark = Decoration.mark({ class: 'cm-highlight' });
    static highlightTheme = EditorView.baseTheme({
        '.cm-highlight': { background: '#3392FF44' },
    });
}
