import type {
    IPublicApiCanvas,
    IPublicEditor,
    IPublicModelClipboard,
} from '@webank/letgo-types';
import {
    Clipboard as ShellClipboard,
} from '../model';
import { editorSymbol } from '../symbols';

const clipboardInstanceSymbol = Symbol('clipboardInstace');

export class Canvas implements IPublicApiCanvas {
    private readonly [editorSymbol]: IPublicEditor;
    private readonly [clipboardInstanceSymbol]: IPublicModelClipboard;

    get isInLiveEditing(): boolean {
        return Boolean(this[editorSymbol].get('designer')?.simulator?.liveEditing?.editing);
    }

    get clipboard(): IPublicModelClipboard {
        return this[clipboardInstanceSymbol];
    }

    constructor(editor: IPublicEditor, readonly workspaceMode: boolean = false) {
        this[editorSymbol] = editor;
        this[clipboardInstanceSymbol] = new ShellClipboard();
    }
}
