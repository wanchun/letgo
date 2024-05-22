import type { IPublicApiHotkey, IPublicTypeHotkeyCallback, IPublicTypeHotkeyCallbacks, Hotkey as InnerHotkey } from '@webank/letgo-editor-core';
import type { IPublicTypeDisposable } from '@webank/letgo-types';
import { hotkeySymbol } from '../symbols';

const innerHotkeySymbol = Symbol('innerHotkey');

export class Hotkey implements IPublicApiHotkey {
    private readonly [innerHotkeySymbol]: InnerHotkey;
    get [hotkeySymbol](): InnerHotkey {
        return this[innerHotkeySymbol];
    }

    constructor(hotkey: InnerHotkey, readonly workspaceMode: boolean = false) {
        this[innerHotkeySymbol] = hotkey;
    }

    get callbacks(): IPublicTypeHotkeyCallbacks {
        return this[hotkeySymbol].callBacks;
    }

    /**
     * @deprecated
     */
    get callBacks() {
        return this.callbacks;
    }

    /**
     * 绑定快捷键
     * @param combos 快捷键，格式如：['command + s'] 、['ctrl + shift + s'] 等
     * @param callback 回调函数
     * @param action
     * @returns
     */
    bind(
        combos: string[] | string,
        callback: IPublicTypeHotkeyCallback,
        action?: string,
    ): IPublicTypeDisposable {
        this[hotkeySymbol].bind(combos, callback, action);
        return () => {
            this[hotkeySymbol].unbind(combos, callback, action);
        };
    }
}
