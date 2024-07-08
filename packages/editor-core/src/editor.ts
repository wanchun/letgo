import EventEmitter from 'eventemitter3';

import { AssetLoader } from '@webank/letgo-common';
import { builtinComponentsMeta } from '@webank/letgo-components';
import type {
    IPublicEditor,
    IPublicTypeAssetsJson,
    IPublicTypeComponentDescription,
    IPublicTypeEditorGetResult,
    IPublicTypeEditorValueKey,
    IPublicTypeRemoteComponentDescription,
} from '@webank/letgo-types';
import { get, isArray } from 'lodash-es';
import { assetsTransform } from './utils/assets-transform';

export class Editor extends EventEmitter implements IPublicEditor {
    private context = new Map<IPublicTypeEditorValueKey, any>();

    async setAssets(asset: IPublicTypeAssetsJson | IPublicTypeAssetsJson[]) {
        const assets: IPublicTypeAssetsJson[] = isArray(asset) ? asset : [asset];
        const resultAsset: IPublicTypeAssetsJson = {
            packages: [],
            components: [...builtinComponentsMeta],
            utils: [],
            sort: {
                groupList: builtinComponentsMeta.reduce((accumulator, currentValue) => {
                    if (currentValue.group && !accumulator.includes(currentValue.group))
                        accumulator.push(currentValue.group);

                    return accumulator;
                }, []),
                categoryList: builtinComponentsMeta.reduce((accumulator, currentValue) => {
                    if (currentValue.category && !accumulator.includes(currentValue.category))
                        accumulator.push(currentValue.category);

                    return accumulator;
                }, []),
            },
        };
        await Promise.all(assets.map(async (asset) => {
            if (!asset)
                return;
            const { packages, components, utils, sort } = asset;
            if (packages?.length) {
                packages.forEach((_package) => {
                    if (!resultAsset.packages.some((res) => {
                        return res.library === _package.library;
                    }))
                        resultAsset.packages.push(_package);
                });
            }

            if (utils?.length) {
                utils.forEach((_util) => {
                    if (!resultAsset.utils.some((res) => {
                        return res.name === _util.name;
                    }))
                        resultAsset.utils.push(_util);
                });
            }

            if (sort?.groupList.length) {
                sort?.groupList.forEach((_group) => {
                    if (!resultAsset.sort.groupList.includes(_group))
                        resultAsset.sort.groupList.push(_group);
                });
            }

            if (sort?.categoryList.length) {
                sort?.categoryList.forEach((category) => {
                    if (!resultAsset.sort.categoryList.includes(category))
                        resultAsset.sort.categoryList.push(category);
                });
            }

            if (components?.length) {
                let componentDescriptions: IPublicTypeComponentDescription[] = [];
                const remoteComponentDescriptions: IPublicTypeRemoteComponentDescription[] = [];
                components.forEach((component: any) => {
                    if (!component)
                        return;

                    if (component.exportName && component.url)
                        remoteComponentDescriptions.push(component);

                    else
                        componentDescriptions.push(component);
                });
                // 如果有远程组件描述协议，则自动加载并补充到资产包中，同时出发 designer.incrementalAssetsReady 通知组件面板更新数据
                if (
                    remoteComponentDescriptions
                    && remoteComponentDescriptions.length
                ) {
                    await Promise.all(
                        remoteComponentDescriptions.map(async (component: IPublicTypeRemoteComponentDescription) => {
                            const { exportName, url } = component;
                            await new AssetLoader().load(url);
                            const remoteMeta = get(window, exportName) as IPublicTypeAssetsJson | null;
                            if (remoteMeta)
                                componentDescriptions = componentDescriptions.concat((remoteMeta.components as IPublicTypeComponentDescription[]) || []);
                        }),
                    );
                }
                componentDescriptions.forEach((_component) => {
                    resultAsset.components.push(_component);
                });
            }
        }));

        this.set('assets', assetsTransform(resultAsset));
    }

    onEvent(name: string | symbol, fn: (...args: any[]) => void) {
        this.on(name, fn);
        return () => {
            this.off(name, fn);
        };
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
        if (x !== undefined)
            fn(x);

        this.setWait(keyOrType, fn);
        return () => {
            this.delWait(keyOrType, fn);
        };
    }

    onChange<T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
        keyOrType: KeyOrType,
        fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void,
    ): () => void {
        this.setWait(keyOrType, fn);
        return () => {
            this.delWait(keyOrType, fn);
        };
    }

    private waits = new Map<
        IPublicTypeEditorValueKey,
        Array<{
            once?: boolean;
            resolve: (data: any) => void;
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
        this.removeAllListeners();
    }
}

export const editor = new Editor();
