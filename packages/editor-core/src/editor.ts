import EventEmitter from 'eventemitter3';
import type {
    IPublicEditor,
    IPublicTypeAssetsJson,
    IPublicTypeComponentDescription,
    IPublicTypeEditorGetResult,
    IPublicTypeEditorValueKey,
    IPublicTypeRemoteComponentDescription,
} from '@harrywan/letgo-types';
import { AssetLoader } from '@harrywan/letgo-common';

export class Editor extends EventEmitter implements IPublicEditor {
    private context = new Map<IPublicTypeEditorValueKey, any>();

    async setAssets(assets: IPublicTypeAssetsJson) {
        const { components } = assets;
        if (components && components.length) {
            const componentDescriptions: IPublicTypeComponentDescription[] = [];
            const remoteComponentDescriptions: IPublicTypeRemoteComponentDescription[]
                = [];
            components.forEach((component: any) => {
                if (!component)
                    return;

                if (component.exportName && component.url)
                    remoteComponentDescriptions.push(component);

                else
                    componentDescriptions.push(component);
            });
            assets.components = componentDescriptions;

            // 如果有远程组件描述协议，则自动加载并补充到资产包中，同时出发 designer.incrementalAssetsReady 通知组件面板更新数据
            if (
                remoteComponentDescriptions
                && remoteComponentDescriptions.length
            ) {
                await Promise.all(
                    remoteComponentDescriptions.map(async (component: any) => {
                        const { exportName, url } = component;
                        await new AssetLoader().load(url);
                        if (window[exportName]) {
                            assets.components = assets.components.concat(
                                window[exportName].components || [],
                            );
                        }
                        return window[exportName];
                    }),
                );
            }
        }
        this.set('assets', assets);
    }

    get<T = undefined, KeyOrType = any>(
        keyOrType: KeyOrType,
    ): IPublicTypeEditorGetResult<T, KeyOrType> | undefined {
        return this.context.get(keyOrType as any);
    }

    has(keyOrType: IPublicTypeEditorValueKey): boolean {
        return this.context.has(keyOrType);
    }

    set(key: IPublicTypeEditorValueKey, data: any): void {
        this.context.set(key, data);
        this.notifyGot(key);
    }

    onceGot<T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
        keyOrType: KeyOrType,
    ): Promise<IPublicTypeEditorGetResult<T, KeyOrType>> {
        const x = this.context.get(keyOrType);
        if (x !== undefined)
            return Promise.resolve(x);

        return new Promise((resolve) => {
            this.setWait(keyOrType, resolve, true);
        });
    }

    onGot<T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
        keyOrType: KeyOrType,
        fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void,
    ): () => void {
        const x = this.context.get(keyOrType);
        if (x !== undefined) {
            fn(x);
            return () => undefined;
        }
        else {
            this.setWait(keyOrType, fn);
            return () => {
                this.delWait(keyOrType, fn);
            };
        }
    }

    private waits = new Map<
        IPublicTypeEditorValueKey,
        Array<{
            once?: boolean
            resolve: (data: any) => void
        }>
    >();

    private notifyGot(key: IPublicTypeEditorValueKey) {
        let waits = this.waits.get(key);
        if (!waits)
            return;

        waits = waits.slice().reverse();
        let i = waits.length;
        while (i--) {
            waits[i].resolve(this.get(key));
            if (waits[i].once)
                waits.splice(i, 1);
        }
        if (waits.length > 0)
            this.waits.set(key, waits);

        else
            this.waits.delete(key);
    }

    private setWait(
        key: IPublicTypeEditorValueKey,
        resolve: (data: any) => void,
        once?: boolean,
    ) {
        const waits = this.waits.get(key);
        if (waits)
            waits.push({ resolve, once });

        else
            this.waits.set(key, [{ resolve, once }]);
    }

    private delWait(key: IPublicTypeEditorValueKey, fn: any) {
        const waits = this.waits.get(key);
        if (!waits)
            return;

        let i = waits.length;
        while (i--) {
            if (waits[i].resolve === fn)
                waits.splice(i, 1);
        }
        if (waits.length < 1)
            this.waits.delete(key);
    }

    purge(): void {
        this.context.clear();
    }
}

export const editor = new Editor();
