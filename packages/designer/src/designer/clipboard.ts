import type { IPublicModelClipboard } from '@webank/letgo-types';
import { isString } from 'lodash-es';

function initInputDom() {
    const input = document.createElement('input');
    input.style.top = '-999px';
    input.style.left = '-999px';
    input.style.position = 'fixed';
    document.body.appendChild(input);
    input.select();

    return input;
}

function getPaste() {
    const input = initInputDom();
    try {
        document.execCommand('paste');
        const { value } = input;
        document.body.removeChild(input);
        return value;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

function copy(text: string) {
    const input = initInputDom();
    input.value = text;
    input.setAttribute('value', text);
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(input);
        return successful;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

export interface IClipboard extends IPublicModelClipboard {

    setData: (data: any) => Promise<void>;

    getData: () => Promise<string>;
}
class Clipboard implements IClipboard {
    async setData(data: any): Promise<void> {
        const text = isString(data) ? data : JSON.stringify(data);
        if (!navigator.clipboard) {
            if (copy(text))
                return Promise.resolve();

            throw new Error('clipboard failed');
        }

        return navigator.clipboard.writeText(text).catch((err) => {
            err && console.warn('clipboard failed', err, err.message, err.name);

            if (copy(text))
                Promise.resolve();

            throw new Error('clipboard failed');
        });
    }

    async getData(): Promise<string> {
        if (!navigator.clipboard)
            return getPaste();

        return navigator.clipboard.readText().catch((_) => {
            return getPaste();
        });
    }
}

export const clipboard = new Clipboard();
