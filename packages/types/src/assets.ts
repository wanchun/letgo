import { ProjectSchema } from './schema';
import { ComponentMetadata } from './metadata';

/**
 * 资产包协议
 */
export interface AssetsJson {
    /**
     * 资产包协议版本号
     */
    version: string;
    /**
     * 大包列表，external与package的概念相似，融合在一起
     */
    packages?: Package[];
    /**
     * 所有组件的描述协议列表所有组件的列表
     */
    components: Array<ComponentDescription>;
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
     * 作为全局变量引用时的名称，和webpack output.library字段含义一样，用来定义全局变量名
     */
    library: string;
    /**
     * 标识当前 package 资源加载在 window.library 上的是否是一个异步对象
     */
    async?: boolean;
    /**
     * 当前资源包的依赖资源的唯一标识列表
     */
    deps?: string[];
    /**
     * 低代码组件的schema
     */
    schema?: ProjectSchema;
}

/**
 * 本地物料描述
 */
export interface ComponentDescription extends ComponentMetadata {
    /**
     * @todo 待补充文档 @jinchan
     */
    keywords: string[];
}
