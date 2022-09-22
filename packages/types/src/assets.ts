import { ProjectSchema } from './schema';
import { ComponentMetadata } from './metadata';

export enum AssetLevel {
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
    AssetLevel.Environment,
    AssetLevel.Library,
    AssetLevel.Theme,
    AssetLevel.Runtime,
    AssetLevel.Components,
    AssetLevel.App,
];

export type URL = string;

export enum AssetType {
    JSUrl = 'jsUrl',
    CSSUrl = 'cssUrl',
    CSSText = 'cssText',
    JSText = 'jsText',
    Bundle = 'bundle',
}
export interface AssetBundle {
    type: AssetType.Bundle;
    level?: AssetLevel;
    assets?: Asset | AssetList | null;
}

export interface AssetItem {
    type: AssetType;
    content?: string | null;
    device?: string;
    level?: AssetLevel;
    id?: string;
}

export type Asset = AssetList | AssetBundle | AssetItem | URL;

export type AssetList = Array<Asset | undefined | null>;

/**
 * 资产包协议
 */
export interface AssetsJson {
    /**
     * 资产包协议版本号
     */
    version?: string;
    /**
     * 大包列表
     */
    packages?: Package[];
    /**
     * 所有组件的描述协议列表所有组件的列表
     */
    components?: Array<ComponentDescription | RemoteComponentDescription>;
    sort?: ComponentSort;
}

/**
 * 用于描述组件面板中的 tab 和 category
 */
export interface ComponentSort {
    /**
     * 用于描述组件面板的 tab 项及其排序，例如：["精选组件", "原子组件"]
     */
    groupList?: string[];
    /**
     * 组件面板中同一个 tab 下的不同区间用 category 区分，category 的排序依照 categoryList 顺序排列；
     */
    categoryList?: string[];
}

export type codeType = 'proCode' | 'lowCode';

/**
 * 定义组件大包及 external 资源的信息
 * 应该被编辑器默认加载
 */
export interface Package {
    /**
     * 资源唯一标识，如果为空，则以 package 为唯一标识
     */
    id?: string;
    /**
     * 资源标题
     */
    title?: string;
    type: codeType;
    /**
     * 包名
     */
    package: string;
    /**
     * 包版本号
     */
    version: string;
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
    schema?: ProjectSchema;
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
}

/**
 * 本地物料描述
 */
export interface ComponentDescription extends ComponentMetadata {
    keywords: string[];
}

/**
 * 远程物料描述
 */
export interface RemoteComponentDescription {
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
