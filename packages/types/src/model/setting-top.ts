import type {
    IPublicModelNode,
    IPublicModelSettingField,
    IPublicTypeCompositeValue,
} from '..';

export interface IPublicModelSettingTop<
  Node = IPublicModelNode,
  SettingField = IPublicModelSettingField,
> {

    /**
     * 返回所属的节点实例
     */
    getNode: () => Node | null;

    /**
     * 获取子级属性对象
     * @param propName
     * @returns
     */
    get: (propName: string | number) => SettingField | null;

    /**
     * 获取指定 propName 的值
     * @param propName
     * @returns
     */
    getPropValue: (propName: string | number) => any;

    /**
     * 设置指定 propName 的值
     * @param propName
     * @param value
     */
    setPropValue: (propName: string | number, value: any) => void;

    /**
     * 清除指定 propName 的值
     * @param propName
     */
    clearPropValue: (propName: string | number) => void;

    getExtraPropValue: (propName: string) => IPublicTypeCompositeValue;

    setExtraPropValue: (propName: string, value: any) => void;

}
