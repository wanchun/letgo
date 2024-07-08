import type { IPublicTypeComponentMetadata } from './metadata';
import type { EitherOr, IPublicTypeUtils } from './utils';
import type { IPublicTypeReference } from './reference';
import type { IPublicTypeComponentSchema, IPublicTypeProjectSchema } from '.';

export enum IPublicEnumAssetLevel {
    // 环境依赖库 比如 react, react-dom
    Environment = 1,
    // 基础类库，比如 lodash deep fusion antd
    Library = 2,
    // 主题
    Theme = 3,
    // 运行时
    Runtime = 4,
    // 业务组件
    Components = 5,
    // 应用 & 页面
    App = 6,
}

export const AssetLevels = [
    IPublicEnumAssetLevel.Environment,
    IPublicEnumAssetLevel.Library,
    IPublicEnumAssetLevel.Theme,
    IPublicEnumAssetLevel.Runtime,
    IPublicEnumAssetLevel.Components,
    IPublicEnumAssetLevel.App,
];

export enum IPublicEnumAssetType {
    JSUrl = 'jsUrl',
    CSSUrl = 'cssUrl',
    CSSText = 'cssText',
    JSText = 'jsText',
    Bundle = 'bundle',
}

export type IPublicTypeURL = string;

export interface IPublicTypeAssetBundle {
    type: IPublicEnumAssetType.Bundle;
    level?: IPublicEnumAssetLevel;
    assets?: IPublicTypeAsset | IPublicTypeAssetList | null;
}

export interface IPublicTypeAssetItem {
    type: IPublicEnumAssetType;
    content?: string | null;
    device?: string;
    level?: IPublicEnumAssetLevel;
    id?: string;
}

export type IPublicTypeAsset = IPublicTypeAssetList | IPublicTypeAssetBundle | IPublicTypeAssetItem | IPublicTypeURL;

export type IPublicTypeAssetList = Array<IPublicTypeAsset | undefined | null>;

/**
 * 资产包协议
 */
export interface IPublicTypeAssetsJson {
    /**
     * 资产包协议版本号
     */
    version?: string;
    /**
     * 大包列表
     */
    packages?: IPublicTypePackage[];
    /**
     * 所有组件的描述协议列表所有组件的列表
     */
    components?: Array<IPublicTypeComponentDescription | IPublicTypeRemoteComponentDescription>;
    /**
     * 排序
     */
    sort?: IPublicTypeComponentSort;
    /**
     * 工具函数
     */
    utils?: IPublicTypeUtils;
}

/**
 * 用于描述组件面板中的 tab 和 category
 */
export interface IPublicTypeComponentSort {
    /**
     * 用于描述组件面板的 tab 项及其排序，例如：["精选组件", "原子组件"]
     */
    groupList?: string[];
    /**
     * 组件面板中同一个 tab 下的不同区间用 category 区分，category 的排序依照 categoryList 顺序排列；
     */
    categoryList?: string[];
}

export type IPublicTypeCodeType = 'proCode' | 'lowCode';

/**
 * 定义组件大包及 external 资源的信息
 * 应该被编辑器默认加载
 */
export type IPublicTypePackage = EitherOr<{
    /**
     * 资源唯一标识，如果为空，则以 package 为唯一标识
     */
    id: string;
    /**
     * 包名
     */
    package: string;
    /**
     * 包版本号
     */
    version: string;
    /**
     * 资源标题
     */
    title?: string;
    /**
     * 类型
     */
    type?: IPublicTypeCodeType;
    /**
     * 组件渲染态视图打包后的 CDN url 列表，包含 js 和 css
     */
    urls?: string[] | any;
    /**
     * 组件编辑态视图打包后的 CDN url 列表，包含 js 和 css
     */
    editUrls?: string[] | any;
    /**
     * 低代码组件的schema
     */
    schema?: IPublicTypeProjectSchema<IPublicTypeComponentSchema>;
    /**
     * 作为全局变量引用时的名称，和webpack output.library字段含义一样，用来定义全局变量名
     */
    library: string;
    /**
     * 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的 Object 内容；
     */
    exportName?: string;
    /**
     * 标识当前 package 资源加载在 window.library 上的是否是一个异步对象
     */
    async?: boolean;
    /**
     * 当前资源包的依赖资源的唯一标识列表
     */
    deps?: string[];
    /**
     * 按需加载时，样式引入
     */
    cssResolver?: (name: string) => string | string[];
}, 'package', 'id'>;

/**
 * 本地物料描述
 */
export interface IPublicTypeComponentDescription extends IPublicTypeComponentMetadata {
    keywords?: string[];
    /**
     * 替代 npm 字段的升级版本
     */
    reference?: IPublicTypeReference;
}

/**
 * 远程物料描述
 */
export interface IPublicTypeRemoteComponentDescription {
    /**
     * 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的 Object 内容；
     */
    exportName?: string;
    /**
     * 组件描述的资源链接；
     */
    url?: string;
    /**
     * 组件(库)的 npm 信息；
     */
    package?: {
        npm?: string;
    };
}
