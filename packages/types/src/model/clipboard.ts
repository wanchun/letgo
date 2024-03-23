export interface IPublicModelClipboard {

    /**
     * 给剪贴板赋值
     * set data to clipboard
     *
     * @param {*} data
     * @since v1.1.0
     */
    setData: (data: any) => Promise<void>;
    getData: () => Promise<string>;
}
