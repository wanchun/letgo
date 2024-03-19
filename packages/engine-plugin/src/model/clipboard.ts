import type { IPublicModelClipboard } from '@webank/letgo-types';
import type { IClipboard } from '@webank/letgo-designer';
import { clipboard } from '@webank/letgo-designer';
import { clipboardSymbol } from '../symbols';

export class Clipboard implements IPublicModelClipboard {
    private readonly [clipboardSymbol]: IClipboard;

    constructor() {
        this[clipboardSymbol] = clipboard;
    }

    setData(data: any): void {
        this[clipboardSymbol].setData(data);
    }

    waitPasteData(
        keyboardEvent: KeyboardEvent,
        cb: (data: any, clipboardEvent: ClipboardEvent) => void,
    ): void {
        this[clipboardSymbol].waitPasteData(keyboardEvent, cb);
    }
}
