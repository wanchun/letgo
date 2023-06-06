// NOTE: 仅用作类型标注，切勿作为实体使用
import {
    assetItem,
    isAssetBundle,
    isAssetItem,
    isCSSUrl,
} from '@webank/letgo-common';
import type { IPublicTypeAssetList } from '@webank/letgo-types';
import {
    AssetLevels,
    IPublicEnumAssetLevel,
    IPublicEnumAssetType,
} from '@webank/letgo-types';
import type { Simulator } from './simulator';
import type { ISimulatorRenderer } from './renderer';

export function createSimulator(
    simulator: Simulator,
    iframe: HTMLIFrameElement,
    vendors: IPublicTypeAssetList = [],
): Promise<ISimulatorRenderer> {
    const win: any = iframe.contentWindow;
    const doc = iframe.contentDocument;

    // 注入host
    win.LETGO_Simulator = simulator;

    const styles: any = {};
    const scripts: any = {};
    AssetLevels.forEach((lv) => {
        styles[lv] = [];
        scripts[lv] = [];
    });

    function parseAssetList(assets: IPublicTypeAssetList, level?: IPublicEnumAssetLevel) {
        for (let asset of assets) {
            if (!asset)
                continue;

            if (isAssetBundle(asset)) {
                if (asset.assets) {
                    parseAssetList(
                        Array.isArray(asset.assets)
                            ? asset.assets
                            : [asset.assets],
                        asset.level || level,
                    );
                }
                continue;
            }
            if (Array.isArray(asset)) {
                parseAssetList(asset, level);
                continue;
            }
            if (!isAssetItem(asset)) {
                asset = assetItem(
                    isCSSUrl(asset) ? IPublicEnumAssetType.CSSUrl : IPublicEnumAssetType.JSUrl,
                    asset,
                    level,
                );
            }
            const id = asset.id ? ` data-id="${asset.id}"` : '';
            const lv = asset.level || level || IPublicEnumAssetLevel.Environment;
            if (asset.type === IPublicEnumAssetType.JSUrl) {
                scripts[lv].push(
                    `<script src="${asset.content}"${id}></script>`,
                );
            }
            else if (asset.type === IPublicEnumAssetType.JSText) {
                scripts[lv].push(`<script${id}>${asset.content}</script>`);
            }
            else if (asset.type === IPublicEnumAssetType.CSSUrl) {
                styles[lv].push(
                    `<link rel="stylesheet" href="${asset.content}"${id} />`,
                );
            }
            else if (asset.type === IPublicEnumAssetType.CSSText) {
                styles[lv].push(
                    `<style type="text/css"${id}>${asset.content}</style>`,
                );
            }
        }
    }

    parseAssetList(vendors);

    const styleFrags = Object.keys(styles)
        .map((key) => {
            return `${styles[key].join('\n')}<meta level="${key}" />`;
        })
        .join('');
    const scriptFrags = Object.keys(scripts)
        .map((key) => {
            return scripts[key].join('\n');
        })
        .join('');

    doc.open();
    doc.write(`
<!doctype html>
<html class="engine-design-mode">
  <head><meta charset="utf-8"/>
    ${styleFrags}
  </head>
  <body>
    ${scriptFrags}
    <script>
    window.dispatchEvent(new Event('load'));
    </script>
  </body>
</html>`);
    doc.close();

    return new Promise((resolve) => {
        const renderer = win.LETGO_SimulatorRenderer || simulator.renderer;
        if (renderer)
            return resolve(renderer);

        const loaded = () => {
            resolve(win.LETGO_SimulatorRenderer || simulator.renderer);
            win.removeEventListener('load', loaded);
        };
        win.addEventListener('load', loaded);
    });
}
