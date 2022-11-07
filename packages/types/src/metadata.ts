import { Slot } from 'vue';
import { PropConfig, PropType } from './prop-config';
import { NpmInfo } from './npm';
import { NodeSchema, ComponentSchema } from './schema';
import { IconType } from './icon';

/**
 * 可用片段
 *
 * 内容为组件不同状态下的低代码 schema (可以有多个)，用户从组件面板拖入组件到设计器时会向页面 schema 中插入 snippets 中定义的组件低代码 schema
 */
export interface Snippet {
    /**
     * 组件分类title
     */
    title?: string;
    /**
     * snippet 截图
     */
    screenshot?: string;
    /**
     * 待插入的 schema
     */
    schema: NodeSchema;
}

/**
 * 编辑体验配置
 */
export interface Configure {
    /**
     * 组件能力配置
     */
    component?: ComponentConfigure;
    /**
     * 通用扩展面板支持性配置
     */
    supports?: ConfigureSupport;
    /**
     * 高级特性配置
     */
    advanced?: Advanced;
}

/**
 * 组件 meta 配置
 */
export interface ComponentMetadata {
    /**
     * 组件名
     */
    componentName: string;
    /**
     * title
     */
    title: string;
    /**
     * 组件描述
     */
    description?: string;
    /**
     * 组件快照
     */
    screenshot?: string;
    /**
     * 组件标签
     */
    tags?: string[];
    /**
     * 组件研发模式
     */
    devMode?: 'proCode' | 'lowCode';
    /**
     * npm 源引入完整描述对象
     */
    npm?: NpmInfo;
    /**
     * lowCode组件的 schema
     */
    schema?: ComponentSchema;
    /**
     * 组件属性信息
     */
    props?: PropConfig[];
    /**
     * 编辑体验增强
     */
    configure?: Configure;
    /**
     * 可用片段
     */
    snippets: Snippet[];
    /**
     * 一级分组
     */
    group?: string;
    /**
     * 二级分组
     */
    category?: string;
    /**
     * 组件优先级排序
     */
    priority?: number;
}

/**
 * 嵌套控制函数
 */
export type NestingFilter = (testNode: any, currentNode: any) => boolean;
/**
 * 嵌套控制
 * 防止错误的节点嵌套，比如 a 嵌套 a, FormField 只能在 Form 容器下，Column 只能在 Table 下等
 */
export interface NestingRule {
    /**
     * 子级白名单
     */
    childWhitelist?: string[] | string | RegExp | NestingFilter;
    /**
     * 父级白名单
     */
    parentWhitelist?: string[] | string | RegExp | NestingFilter;
    /**
     * 后裔白名单
     */
    descendantWhitelist?: string[] | string | RegExp | NestingFilter;
    /**
     * 后裔黑名单
     */
    descendantBlacklist?: string[] | string | RegExp | NestingFilter;
    /**
     * 祖先白名单 可用来做区域高亮
     */
    ancestorWhitelist?: string[] | string | RegExp | NestingFilter;
}

/**
 * 组件能力配置
 */
export interface ComponentConfigure {
    /**
     * 是否容器组件
     */
    isContainer?: boolean;
    /**
     * 组件是否带浮层，浮层组件拖入设计器时会遮挡画布区域，此时应当辅助一些交互以防止阻挡
     */
    isModal?: boolean;
    /**
     * 是否存在渲染的根节点
     */
    isNullNode?: boolean;
    /**
     * 嵌套控制：防止错误的节点嵌套
     * 比如 a 嵌套 a, FormField 只能在 Form 容器下，Column 只能在 Table 下等
     */
    nestingRule?: NestingRule;

    /**
     * 是否是最小渲染单元
     * 最小渲染单元下的组件渲染和更新都从单元的根节点开始渲染和更新。如果嵌套了多层最小渲染单元，渲染会从最外层的最小渲染单元开始渲染。
     */
    isMinimalRenderUnit?: boolean;

    /**
     * 组件选中框的 cssSelector
     */
    rootSelector?: string;
    /**
     * 禁用的行为，可以为 `'copy'`, `'move'`, `'remove'` 或它们组成的数组
     */
    disableBehaviors?: string[] | string;
    /**
     * 用于详细配置上述操作项的内容
     */
    actions?: ComponentAction[];
}

export type ConfigureSupportEvent =
    | string
    | {
          name: string;
          propType?: PropType;
          description?: string;
      };

/**
 * 通用扩展面板支持性配置
 */
export interface ConfigureSupport {
    /**
     * 支持事件列表
     */
    events?: ConfigureSupportEvent[];
    /**
     * 支持 className 设置
     */
    className?: boolean;
    /**
     * 支持样式设置
     */
    style?: boolean;
    /**
     * 支持循环设置
     */
    loop?: boolean;
    /**
     * 支持条件式渲染设置
     */
    condition?: boolean;
}

/**
 * 动作描述
 */
export interface ActionContentObject {
    /**
     * 图标
     */
    icon?: IconType;
    /**
     * 描述
     */
    title?: string;
    /**
     * 执行动作
     */
    action?: (currentNode: any) => void;
}

export type ComponentActionType = string | ActionContentObject | Slot;

export interface ComponentAction {
    /**
     * behaviorName
     */
    name: string;
    /**
     * 菜单名称
     */
    content: ComponentActionType;
    /**
     * 子集
     */
    items?: ComponentAction[];
    /**
     * 显示与否
     * always: 无法禁用
     */
    condition?: boolean | ((currentNode: any) => boolean) | 'always';
    /**
     * 显示在工具条上
     */
    important?: boolean;
}

export function isActionContentObject(obj: any): obj is ActionContentObject {
    return obj && typeof obj === 'object';
}

export interface Advanced {
    /**
     * 配置 callbacks 可捕获引擎抛出的一些事件，例如 onNodeAdd、onResize 等
     */
    callbacks?: Callbacks;
}

/**
 * 配置 callbacks 可捕获引擎抛出的一些事件，例如 onNodeAdd、onResize 等
 */
export interface Callbacks {
    // hooks
    onMouseDownHook?: (e: MouseEvent, currentNode: any) => any;
    onDblClickHook?: (e: MouseEvent, currentNode: any) => any;
    onClickHook?: (e: MouseEvent, currentNode: any) => any;
    onMoveHook?: (currentNode: any) => boolean;
    // thinkof 限制性拖拽
    onHoverHook?: (currentNode: any) => boolean;
    onChildMoveHook?: (childNode: any, currentNode: any) => boolean;

    // events
    onNodeRemove?: (removedNode: any, currentNode: any) => void;
    onNodeAdd?: (addedNode: any, currentNode: any) => void;
    onSubtreeModified?: (currentNode: any, options: any) => void;
    onResize?: (
        e: MouseEvent & {
            trigger: string;
            deltaX?: number;
            deltaY?: number;
        },
        currentNode: any,
    ) => void;
    onResizeStart?: (
        e: MouseEvent & {
            trigger: string;
            deltaX?: number;
            deltaY?: number;
        },
        currentNode: any,
    ) => void;
    onResizeEnd?: (
        e: MouseEvent & {
            trigger: string;
            deltaX?: number;
            deltaY?: number;
        },
        currentNode: any,
    ) => void;
}
