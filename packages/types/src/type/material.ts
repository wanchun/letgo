import type { IPublicTypeAssetsJson, IPublicTypeContextMenuAction, IPublicTypeContextMenuItem, IPublicTypeDisposable } from '..';

export interface IPublicApiMaterial {
    /**
     * 设置「资产包」结构
     * set data for Assets
     * @returns void
     */
    setAssets: (assets: IPublicTypeAssetsJson[] | IPublicTypeAssetsJson) => Promise<void>;

    /**
     * 获取「资产包」结构
     * get AssetsJson data
     * @returns IPublicTypeAssetsJson
     */
    getAssets: () => IPublicTypeAssetsJson | undefined;

    /**
     * 监听 assets 变化的事件
     * add callback for assets changed event
     * @param fn
     */
    onChangeAssets: (fn: () => void) => IPublicTypeDisposable;

    /**
     * 添加右键菜单项
     * @param action
     */
    addContextMenuOption: (action: IPublicTypeContextMenuAction) => void;

    /**
     * 删除特定右键菜单项
     * @param name
     */
    removeContextMenuOption: (name: string) => void;

    /**
     * 调整右键菜单项布局
     * @param actions
     */
    adjustContextMenuLayout: (fn: (actions: IPublicTypeContextMenuItem[]) => IPublicTypeContextMenuItem[]) => void;
}
