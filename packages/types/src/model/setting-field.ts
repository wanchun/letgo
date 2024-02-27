import type {
    IPublicModelComponentMeta,
    IPublicModelNode,
    IPublicModelSettingTop,
    IPublicTypeCompositeValue,
    IPublicTypeCustomView,
    IPublicTypeFieldConfig,
    IPublicTypeFieldExtraProps,
    IPublicTypeSetValueOptions,
    IPublicTypeSetterType,
} from '..';

export interface IBaseModelSettingField<
    SettingTop,
    SettingField,
    ComponentMeta,
    Node,
> {

    /**
     * 获取设置属性的父设置属性
     */
    readonly parent: SettingTop | SettingField;

    /**
     * 获取设置属性的 isGroup
     */
    get isGroup(): boolean;

    /**
     * 获取设置属性的 id
     */
    get id(): string;

    /**
     * 获取设置属性的 name
     */
    get name(): string | number | undefined;

    /**
     * 获取设置属性的 path
     */
    get path(): (string | number)[];

    /**
     * 获取设置属性的 title
     */
    get title(): string;

    /**
     * 获取设置属性的 setter
     */
    get setter(): IPublicTypeSetterType | null;

    /**
     * 获取设置属性的 expanded
     */
    get expanded(): boolean;

    /**
     * 获取设置属性的 extraProps
     */
    get extraProps(): IPublicTypeFieldExtraProps<SettingField>;

    /**
     * 获取顶级设置属性
     */
    get top(): SettingTop;

    /**
     * 是否是 SettingField 实例
     */
    get isSettingField(): boolean;

    /**
     * componentMeta
     */
    get componentMeta(): ComponentMeta | null;

    /**
     * 获取设置属性的 items
     */
    get items(): Array<SettingField | IPublicTypeCustomView>;

    getKey: () => string | number;

    /**
     * 设置 key 值
     * @param key
     */
    setKey: (key: string | number, changePropKey?: boolean) => void;

    /**
     * 设置值
     * @param val 值
     */
    setValue: (val: IPublicTypeCompositeValue, extraOptions?: IPublicTypeSetValueOptions) => void;

    /**
     * 设置子级属性值
     * @param propName 子属性名
     * @param value 值
     */
    setPropValue: (propName: string | number, value: any) => void;

    /**
     * 清空指定属性值
     * @param propName
     */
    clearPropValue: (propName: string | number) => void;

    /**
     * 获取配置的默认值
     * @returns
     */
    getDefaultValue: () => any;

    /**
     * 获取值
     * @returns
     */
    getValue: () => any;

    /**
     * 获取子级属性值
     * @param propName 子属性名
     * @returns
     */
    getPropValue: (propName: string | number) => any;

    /**
     * 获取顶层附属属性值
     */
    getExtraPropValue: (propName: string) => any;

    /**
     * 设置顶层附属属性值
     */
    setExtraPropValue: (propName: string, value: any) => void;

    /**
     * 是否绑定了变量
     * @returns
     */
    isUseVariable: () => boolean;

    /**
     * 设置绑定变量
     * @param flag
     */
    setUseVariable: (flag: boolean) => void;

    /**
     * 创建一个设置 field 实例
     * @param config
     * @returns
     */
    createField: (config: IPublicTypeFieldConfig<SettingField>) => SettingField;

    /**
     * 获取值，当为变量时，返回 mock
     * @returns
     */
    getMockOrValue: () => any;

    /**
     * 销毁当前 field 实例
     */
    purge: () => void;

    /**
     * 移除当前 field 实例
     */
    remove: () => void;

    /**
     *
     */
    getNode: () => Node | null;
}

export interface IPublicModelSettingField extends IBaseModelSettingField<
  IPublicModelSettingTop,
  IPublicModelSettingField,
  IPublicModelComponentMeta,
  IPublicModelNode
> {

}
