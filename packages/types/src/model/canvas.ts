import type { IPublicModelClipboard } from './clipboard';

/**
 * canvas - 画布 API
 * @since v1.1.0
 */
export interface IPublicApiCanvas {

    /**
     * 是否处于 LiveEditing 状态
     *
     * check if canvas is in liveEditing state
     * @since v1.1.0
     */
    get isInLiveEditing(): boolean;

    /**
     * 获取全局剪贴板实例
     *
     * get clipboard instance
     *
     * @since v1.1.0
     */
    get clipboard(): IPublicModelClipboard;
}
