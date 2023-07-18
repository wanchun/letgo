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
    async setAssets(assets: IPublicTypeAssetsJson[] | IPublicTypeAssetsJson) {
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
     * 监听 assets 变化的事件
     * @param fn
     */
    onChangeAssets(fn: () => void) {
        // 设置 assets，经过 setAssets 赋值
        this[editorSymbol].onGot('assets', fn);
    }
}
