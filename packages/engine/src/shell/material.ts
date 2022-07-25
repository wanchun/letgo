import { Editor } from '@webank/letgo-editor-core';
import { Designer } from '@webank/letgo-designer';
import { AssetsJson } from '@webank/letgo-types';
import { editorSymbol, designerSymbol } from './symbols';

export class Material {
    private readonly [editorSymbol]: Editor;
    private readonly [designerSymbol]: Designer;

    constructor(editor: Editor) {
        this[editorSymbol] = editor;
        this[designerSymbol] = editor.get('designer')!;
    }

    /**
     * 设置「资产包」结构
     * @param assets
     * @returns
     */
    async setAssets(assets: AssetsJson) {
        return await this[editorSymbol].setAssets(assets);
    }

    /**
     * 获取「资产包」结构
     * @returns
     */
    getAssets(): AssetsJson {
        return this[editorSymbol].get('assets');
    }

    /**
     * 添加资产包
     * @returns
     */
    addAssets(incrementalAssets: AssetsJson) {
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
