import { EventEmitter } from 'eventemitter3';
import { DocumentModel } from '../document';
import { Node } from '../node';

const DETECTING_CHANGE_EVENT = 'detectingChange';

export class Detecting {
    private _enable = true;

    get enable() {
        return this._enable;
    }

    set enable(flag: boolean) {
        this._enable = flag;
        if (!flag) {
            this._current = null;
        }
    }

    xRayMode = false;

    private _current: Node | null = null;

    private emitter = new EventEmitter();

    constructor() {}

    get current() {
        return this._current;
    }

    capture(node: Node | null) {
        if (this._current !== node) {
            this._current = node;
            this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
        }
    }

    release(node: Node | null) {
        if (this._current === node) {
            this._current = null;
            this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
        }
    }

    leave(document: DocumentModel | undefined) {
        if (this.current && this.current.document === document) {
            this._current = null;
        }
    }

    onDetectingChange(fn: (node: Node) => void) {
        this.emitter.on(DETECTING_CHANGE_EVENT, fn);
        return () => {
            this.emitter.off(DETECTING_CHANGE_EVENT, fn);
        };
    }
}
