import { EventEmitter } from 'eventemitter3';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
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
            this._current = null;
    }

    private _current: INode | null;

    private emitter = new EventEmitter();

    get current() {
        return this._current;
    }

    constructor() {
        markShallowReactive(this, {
            _current: null,
        });
        markComputed(this, ['current']);
    }

    capture(node: INode | null) {
        if (this._current !== node) {
            this._current = node;
            this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
        }
    }

    release(node: INode | null) {
        if (this._current === node) {
            this._current = null;
            this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
        }
    }

    leave(document: DocumentModel | undefined) {
        if (this.current && this.current.document === document)
            this._current = null;
    }

    onDetectingChange(fn: (node: INode) => void) {
        this.emitter.on(DETECTING_CHANGE_EVENT, fn);
        return () => {
            this.emitter.off(DETECTING_CHANGE_EVENT, fn);
        };
    }
}
