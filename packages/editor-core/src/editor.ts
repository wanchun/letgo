import { EventEmitter } from 'events';
import {
    IEditor,
    KeyType,
    GetReturnType,
    AssetsJson,
    Emitter,
} from '@webank/letgo-types';

export class Editor
    extends (EventEmitter as unknown as { new (): Emitter })
    implements IEditor
{
    private context = new Map<KeyType, any>();

    async setAssets(assets: AssetsJson) {
        this.set('assets', assets);
    }

    get<T = undefined, KeyOrType = any>(
        keyOrType: KeyOrType,
    ): GetReturnType<T, KeyOrType> | undefined {
        return this.context.get(keyOrType as any);
    }

    has(keyOrType: KeyType): boolean {
        return this.context.has(keyOrType);
    }

    set(key: KeyType, data: any): void {
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
            return () => void 0;
        } else {
            this.setWait(keyOrType, fn);
            return () => {
                this.delWait(keyOrType, fn);
            };
        }
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

    destroy(): void {
        this.context.clear();
    }
}

export const editor = new Editor();
