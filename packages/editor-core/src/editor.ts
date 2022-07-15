import { StrictEventEmitter } from 'strict-event-emitter-types';
import { EventEmitter } from 'events';
import { GlobalEvent } from '@webank/letgo-types';
import { engineConfig } from './config';

export type KeyType = (new (...args: any[]) => any) | symbol | string;
export type ClassType = new (...args: any[]) => any;

export interface GetOptions {
    forceNew?: boolean;
    sourceCls?: ClassType;
}
export type GetReturnType<T, ClsType> = T extends undefined
    ? ClsType extends {
          prototype: infer R;
      }
        ? R
        : any
    : T;

export declare interface Editor
    extends StrictEventEmitter<EventEmitter, GlobalEvent.EventConfig> {
    addListener(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): (() => void)[];
    rawListeners(event: string | symbol): (() => void)[];
    listenerCount(type: string | symbol): number;
    // Added in Node 6...
    prependListener(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this;
    prependOnceListener(
        event: string | symbol,
        listener: (...args: any[]) => void,
    ): this;
    eventNames(): Array<string | symbol>;
}

const keyBlacklist = [
    'designer',
    'skeleton',
    'currentDocument',
    'simulator',
    'plugins',
];

export class Editor extends (EventEmitter as any) {
    private context = new Map<KeyType, any>();

    get<T = undefined, KeyOrType = any>(
        keyOrType: KeyOrType,
    ): GetReturnType<T, KeyOrType> | undefined {
        return this.context.get(keyOrType as any);
    }

    has(keyOrType: KeyType): boolean {
        return this.context.has(keyOrType);
    }

    set(key: KeyType, data: any): void {
        // store the data to engineConfig while invoking editor.set()
        if (!keyBlacklist.includes(key as string)) {
            engineConfig.set(key as any, data);
        }
        this.context.set(key, data);
        this.notifyGot(key);
    }

    onceGot<T = undefined, KeyOrType extends KeyType = any>(
        keyOrType: KeyOrType,
    ): Promise<GetReturnType<T, KeyOrType>> {
        const x = this.context.get(keyOrType);
        if (x !== undefined) {
            return Promise.resolve(x);
        }
        return new Promise((resolve) => {
            this.setWait(keyOrType, resolve, true);
        });
    }

    onGot<T = undefined, KeyOrType extends KeyType = any>(
        keyOrType: KeyOrType,
        fn: (data: GetReturnType<T, KeyOrType>) => void,
    ): () => void {
        const x = this.context.get(keyOrType);
        if (x !== undefined) {
            fn(x);
            return () => {};
        } else {
            this.setWait(keyOrType, fn);
            return () => {
                this.delWait(keyOrType, fn);
            };
        }
    }

    register(data: any, key?: KeyType): void {
        this.context.set(key || data, data);
        this.notifyGot(key || data);
    }

    private waits = new Map<
        KeyType,
        Array<{
            once?: boolean;
            resolve: (data: any) => void;
        }>
    >();

    private notifyGot(key: KeyType) {
        let waits = this.waits.get(key);
        if (!waits) {
            return;
        }
        waits = waits.slice().reverse();
        let i = waits.length;
        while (i--) {
            waits[i].resolve(this.get(key));
            if (waits[i].once) {
                waits.splice(i, 1);
            }
        }
        if (waits.length > 0) {
            this.waits.set(key, waits);
        } else {
            this.waits.delete(key);
        }
    }

    private setWait(
        key: KeyType,
        resolve: (data: any) => void,
        once?: boolean,
    ) {
        const waits = this.waits.get(key);
        if (waits) {
            waits.push({ resolve, once });
        } else {
            this.waits.set(key, [{ resolve, once }]);
        }
    }

    private delWait(key: KeyType, fn: any) {
        const waits = this.waits.get(key);
        if (!waits) {
            return;
        }
        let i = waits.length;
        while (i--) {
            if (waits[i].resolve === fn) {
                waits.splice(i, 1);
            }
        }
        if (waits.length < 1) {
            this.waits.delete(key);
        }
    }
}

export const editor = new Editor();
