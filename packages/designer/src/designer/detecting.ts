import type { ShallowRef } from 'vue';
import { shallowRef } from 'vue';
import { EventEmitter } from 'eventemitter3';
import type { DocumentModel } from '../document';
import type { INode } from '../types';

const DETECTING_CHANGE_EVENT = 'detectingChange';

export class Detecting {
    private _enable = true;

    get enable() {
        return this._enable;
    }

    set enable(flag: boolean) {
        this._enable = flag;
        if (!flag)
            this._current.value = null;
    }

    xRayMode = false;

    private _current: ShallowRef<INode | null> = shallowRef(null);

    private emitter = new EventEmitter();

    get current() {
        return this._current;
    }

    capture(node: INode | null) {
        if (this._current.value !== node) {
            this._current.value = node;
            this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
        }
    }

    release(node: INode | null) {
        if (this._current.value === node) {
            this._current.value = null;
            this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
        }
    }

    leave(document: DocumentModel | undefined) {
        if (this.current.value && this.current.value.document === document)
            this._current.value = null;
    }

    onDetectingChange(fn: (node: INode) => void) {
        this.emitter.on(DETECTING_CHANGE_EVENT, fn);
        return () => {
            this.emitter.off(DETECTING_CHANGE_EVENT, fn);
        };
    }
}
