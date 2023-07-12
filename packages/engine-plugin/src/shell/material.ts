import type { Editor } from '@harrywan/letgo-editor-core';
import type { Designer } from '@harrywan/letgo-designer';
import type { IPublicTypeAssetsJson } from '@harrywan/letgo-types';
import { designerSymbol, editorSymbol } from './symbols';

export class Material {
    private readonly [editorSymbol]: Editor;
    private readonly [designerSymbol]: Designer;

    constructor(editor: Editor, designer: Designer) {
        this[editorSymbol] = editor;
        this[designerSymbol] = designer;
    }

    /**
     * 设置「资产包」结构
     * @param assets
     * @returns
     */
    async setAssets(assets: IPublicTypeAssetsJson) {
        return await this[editorSymbol].setAssets(assets);
    }

    /**
     * 获取「资产包」结构
     * @returns
     */
    getAssets(): IPublicTypeAssetsJson {
        return this[editorSymbol].get('assets');
    }

    /**
     * 添加资产包
     * @returns
     */
    addAssets(incrementalAssets: IPublicTypeAssetsJson) {
        const assets = this.getAssets();
        if (incrementalAssets.packages) {
            assets.packages = [
                ...(assets.packages || []),
                ...incrementalAssets.packages,
            ];
        }
        if (incrementalAssets.components) {
            assets.components = [
                ...(assets.components || []),
                ...incrementalAssets.components,
            ];
        }
        if (incrementalAssets.utils) {
            assets.utils = [
                ...(assets.utils || []),
                ...incrementalAssets.utils,
            ];
        }
        if (incrementalAssets.sort) {
            assets.sort = {
                groupList: [
                    ...(assets.sort?.groupList || []),
                    ...(incrementalAssets.sort?.groupList || []),
                ],
                categoryList: [
                    ...(assets.sort?.categoryList || []),
                    ...(incrementalAssets.sort?.categoryList || []),
                ],
            };
        }
        this.setAssets(assets);
    }

    /**
     * 监听 assets 变化的事件
     * @param fn
     */
    onChangeAssets(fn: () => void) {
        // 设置 assets，经过 setAssets 赋值
        this[editorSymbol].onGot('assets', fn);
    }
}
