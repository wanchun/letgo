import type {
    IPublicTypeAsset,
    IPublicTypeAssetBundle,
    IPublicTypeAssetItem,
    IPublicTypeAssetList,
    IPublicTypeAssetsJson,
} from '@webank/letgo-types';
import {
    IPublicEnumAssetLevel,
    AssetLevels,
    IPublicEnumAssetType,
} from '@webank/letgo-types';
import { isCSSUrl } from './is-css-url';
import { createDefer } from './create-defer';
import { evaluate, load } from './script';

export function isAssetItem(obj: any): obj is IPublicTypeAssetItem {
    return obj && obj.type;
}

export function isAssetBundle(obj: any): obj is IPublicTypeAssetBundle {
    return obj && obj.type === IPublicEnumAssetType.Bundle;
}

export function assetBundle(
    assets?: IPublicTypeAsset | IPublicTypeAssetList | null,
    level?: IPublicEnumAssetLevel,
): IPublicTypeAssetBundle | null {
    if (!assets)
        return null;

    return {
        type: IPublicEnumAssetType.Bundle,
        assets,
        level,
    };
}

/*
urls: "view.js,view2 <device selector>, view3 <device selector>",
urls: [
  "view.js",
  "view.js *",
  "view1.js mobile|pc",
  "view2.js <device selector>"
] */
export function assetItem(
    type: IPublicEnumAssetType,
    content?: string | null,
    level?: IPublicEnumAssetLevel,
    id?: string,
): IPublicTypeAssetItem | null {
    if (!content)
        return null;

    return {
        type,
        content,
        level,
        id,
    };
}

export function mergeAssets(
    assets: IPublicTypeAssetsJson,
    incrementalAssets: IPublicTypeAssetsJson,
): IPublicTypeAssetsJson {
    if (incrementalAssets.packages) {
        assets.packages = [
            ...(assets.packages || []),
            ...incrementalAssets.packages,
        ];
    }

    if (incrementalAssets.components) {
        assets.components = [
            ...assets.components,
            ...incrementalAssets.components,
        ];
    }

    return assets;
}

export class StylePoint {
    private lastContent: string | undefined;

    private lastUrl: string | undefined;

    private placeholder: Element | Text;

    readonly level: number;

    readonly id: string;

    constructor(level: number, id?: string) {
        this.level = level;
        if (id)
            this.id = id;

        let placeholder: any;
        if (id)
            placeholder = document.head.querySelector(`style[data-id="${id}"]`);

        if (!placeholder) {
            placeholder = document.createTextNode('');
            const meta = document.head.querySelector(`meta[level="${level}"]`);
            if (meta)
                document.head.insertBefore(placeholder, meta);

            else
                document.head.appendChild(placeholder);
        }
        this.placeholder = placeholder;
    }

    applyText(content: string) {
        if (this.lastContent === content)
            return;

        this.lastContent = content;
        this.lastUrl = undefined;
        const element = document.createElement('style');
        element.setAttribute('type', 'text/css');
        if (this.id)
            element.setAttribute('data-id', this.id);

        element.appendChild(document.createTextNode(content));
        document.head.insertBefore(
            element,
            this.placeholder.parentNode === document.head
                ? this.placeholder.nextSibling
                : null,
        );
        document.head.removeChild(this.placeholder);
        this.placeholder = element;
    }

    applyUrl(url: string) {
        if (this.lastUrl === url)
            return;

        this.lastContent = undefined;
        this.lastUrl = url;
        const element = document.createElement('link');
        element.onload = onload;
        element.onerror = onload;

        const i = createDefer();
        function onload(e: any) {
            element.onload = null;
            element.onerror = null;
            if (e.type === 'load')
                i.resolve();

            else
                i.reject();
        }

        element.href = url;
        element.rel = 'stylesheet';
        if (this.id)
            element.setAttribute('data-id', this.id);

        document.head.insertBefore(
            element,
            this.placeholder.parentNode === document.head
                ? this.placeholder.nextSibling
                : null,
        );
        document.head.removeChild(this.placeholder);
        this.placeholder = element;
        return i.promise();
    }
}

function parseAssetList(
    scripts: any,
    styles: any,
    assets: IPublicTypeAssetList,
    level?: IPublicEnumAssetLevel,
) {
    for (const asset of assets)
        parseAsset(scripts, styles, asset, level);
}

function parseAsset(
    scripts: any,
    styles: any,
    asset: IPublicTypeAsset | undefined | null,
    level?: IPublicEnumAssetLevel,
) {
    if (!asset)
        return;

    if (Array.isArray(asset))
        return parseAssetList(scripts, styles, asset, level);

    if (isAssetBundle(asset)) {
        if (asset.assets) {
            if (Array.isArray(asset.assets)) {
                parseAssetList(
                    scripts,
                    styles,
                    asset.assets,
                    asset.level || level,
                );
            }
            else {
                parseAsset(scripts, styles, asset.assets, asset.level || level);
            }
            return;
        }
        return;
    }

    if (!isAssetItem(asset)) {
        asset = assetItem(
            isCSSUrl(asset) ? IPublicEnumAssetType.CSSUrl : IPublicEnumAssetType.JSUrl,
            asset,
            level,
        )!;
    }

    let lv = asset.level || level;

    if (!lv || IPublicEnumAssetLevel[lv] == null)
        lv = IPublicEnumAssetLevel.App;

    asset.level = lv;
    if (asset.type === IPublicEnumAssetType.CSSUrl || asset.type == IPublicEnumAssetType.CSSText)
        styles[lv].push(asset);

    else
        scripts[lv].push(asset);
}

export class AssetLoader {
    async load(asset: IPublicTypeAsset) {
        const styles: any = {};
        const scripts: any = {};
        AssetLevels.forEach((lv) => {
            styles[lv] = [];
            scripts[lv] = [];
        });
        parseAsset(scripts, styles, asset);
        const styleQueue: IPublicTypeAssetItem[] = styles[IPublicEnumAssetLevel.Environment].concat(
            styles[IPublicEnumAssetLevel.Library],
            styles[IPublicEnumAssetLevel.IPublicTypeTheme],
            styles[IPublicEnumAssetLevel.Runtime],
            styles[IPublicEnumAssetLevel.App],
        );
        const scriptQueue: IPublicTypeAssetItem[] = scripts[IPublicEnumAssetLevel.Environment].concat(
            scripts[IPublicEnumAssetLevel.Library],
            scripts[IPublicEnumAssetLevel.IPublicTypeTheme],
            scripts[IPublicEnumAssetLevel.Runtime],
            scripts[IPublicEnumAssetLevel.App],
        );
        await Promise.all(
            styleQueue.map(({ content, level, type, id }) =>
                this.loadStyle(content, level!, type === IPublicEnumAssetType.CSSUrl, id),
            ),
        );
        await Promise.all(
            scriptQueue.map(({ content, type }) =>
                this.loadScript(content, type === IPublicEnumAssetType.JSUrl),
            ),
        );
    }

    private stylePoints = new Map<string, StylePoint>();

    private loadStyle(
        content: string | undefined | null,
        level: IPublicEnumAssetLevel,
        isUrl?: boolean,
        id?: string,
    ) {
        if (!content)
            return;

        let point: StylePoint | undefined;
        if (id) {
            point = this.stylePoints.get(id);
            if (!point) {
                point = new StylePoint(level, id);
                this.stylePoints.set(id, point);
            }
        }
        else {
            point = new StylePoint(level);
        }
        return isUrl ? point.applyUrl(content) : point.applyText(content);
    }

    private loadScript(content: string | undefined | null, isUrl?: boolean) {
        if (!content)
            return;

        return isUrl ? load(content) : evaluate(content);
    }

    // todo 补充类型
    async loadAsyncLibrary(asyncLibraryMap: Record<string, any>) {
        const promiseList: any[] = [];
        const libraryKeyList: any[] = [];
        for (const key in asyncLibraryMap) {
            // 需要异步加载
            if (asyncLibraryMap[key].async) {
                promiseList.push(window[asyncLibraryMap[key].library]);
                libraryKeyList.push(asyncLibraryMap[key].library);
            }
        }
        await Promise.all(promiseList).then((mods) => {
            if (mods.length > 0) {
                mods.map((item, index) => {
                    window[libraryKeyList[index]] = item;
                    return item;
                });
            }
        });
    }
}
