import type { IPublicModelClipboard } from '@webank/letgo-types';
import { isString } from 'lodash-es';

let copyText: string = '';

export interface IClipboard extends IPublicModelClipboard {

    setData: (data: any) => Promise<void>;

    getData: () => Promise<string>;
}
class Clipboard implements IClipboard {
    async setData(data: any): Promise<void> {
        const text = isString(data) ? data : JSON.stringify(data);
        copyText = text;
        if (!navigator.clipboard)
            return;

        try {
            await navigator.clipboard.writeText(text);
        }
        catch (err) {
            console.warn('writeText failed', err);
        }
    }

    async getData(): Promise<string> {
        let res = copyText;
        if (!navigator.clipboard)
            return res;

        try {
            res = await navigator.clipboard.readText();
        }
        catch (err) {
            console.warn('readText failed', err);
        }
        return res;
    }
}

export const clipboard = new Clipboard();
