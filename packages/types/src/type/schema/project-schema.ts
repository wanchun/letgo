import type {
    ICodeStruct,
    IPublicTypeAppConfig,
    IPublicTypeComponentsMap,
    IPublicTypeIconSchema,
    IPublicTypeJSONObject,
    IPublicTypePackage,
    IPublicTypeRootSchema,
    IPublicTypeUtils,
} from '../..';

/**
 * 应用描述
 */
export interface IPublicTypeProjectSchema<T = IPublicTypeRootSchema> {
    id?: string;
    /**
     * 当前应用协议版本号
     */
    version: string;
    /**
     * 当前应用所有组件映射关系
     */
    componentsMap: IPublicTypeComponentsMap;
    /**
     * 描述应用所有页面、低代码组件的组件树
     * 低代码业务组件树描述
     * 是长度固定为1的数组, 即数组内仅包含根容器的描述（低代码业务组件容器类型）
     */
    componentsTree: T[];
    /**
     * 应用范围内的全局自定义函数或第三方工具类扩展
     */
    utils?: IPublicTypeUtils;
    /**
     * 应用范围内的全局常量
     */
    constants?: IPublicTypeJSONObject;
    /**
     * 应用范围内的全局样式
     */
    css?: string;
    /**
     * 全局逻辑
     */
    code?: ICodeStruct;
    /**
     * 当前应用配置信息
     */
    config?: IPublicTypeAppConfig;
    /**
     * 当前应用元数据信息
     */
    meta?: Record<string, any>;
    /**
     * 大包列表
     */
    packages?: IPublicTypePackage[];
}

export function isProjectSchema(data: any): data is IPublicTypeProjectSchema {
    return data && data.componentsTree;
}
