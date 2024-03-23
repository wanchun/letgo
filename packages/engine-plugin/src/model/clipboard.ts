import type { IPublicModelClipboard } from '@webank/letgo-types';
import type { IClipboard } from '@webank/letgo-designer';
import { clipboard } from '@webank/letgo-designer';
import { clipboardSymbol } from '../symbols';

export class Clipboard implements IPublicModelClipboard {
    private readonly [clipboardSymbol]: IClipboard;

    constructor() {
        this[clipboardSymbol] = clipboard;
    }

    setData(data: any): Promise<void> {
        return this[clipboardSymbol].setData(data);
    }

    getData(): Promise<string> {
        return this[clipboardSymbol].getData();
    }
}
