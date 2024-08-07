import type {
    IPublicTypeComponentAction,
    IPublicTypeComponentSchema,
    IPublicTypeFieldConfig,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeNpmInfo,
    IPublicTypeProjectSchema,
    IPublicTypeTransformedComponentMetadata,
} from '..';
import type { IPublicModelNode } from './node';

export interface IPublicModelComponentMeta<
  Node = IPublicModelNode,
> {

    /**
     * 组件名
     * component name
     */
    get componentName(): string;

    /**
     * 是否是「容器型」组件
     * is container node or not
     */
    get isContainer(): boolean;

    /**
     * 是否是最小渲染单元。
     * 当组件需要重新渲染时：
     *  若为最小渲染单元，则只渲染当前组件，
     *  若不为最小渲染单元，则寻找到上层最近的最小渲染单元进行重新渲染，直至根节点。
     *
     * check if this is a mininal render unit.
     * when a rerender is needed for a component:
     *  case 'it`s a mininal render unit':  only render itself.
     *  case 'it`s not a mininal render unit': find a mininal render unit to render in
     *  its ancesters until root node is reached.
     */
    get isMinimalRenderUnit(): boolean;

    /**
     * 是否为「模态框」组件
     * check if this is a modal component or not.
     */
    get isModal(): boolean;

    /**
     * 弹层显示控制属性名
     */
    get dialogControlProp(): string;

    /**
     * 获取用于设置面板显示用的配置
     * get configs for Settings Panel
     */
    get propsConfigure(): IPublicTypeFieldConfig[];

    /**
     * 标题
     * title for this component
     */
    get title(): string;

    /**
     * 组件 npm 信息
     * npm informations
     */
    get npm(): IPublicTypeNpmInfo;

    /**
     * 当前组件的可用 Action
     * available actions
     */
    get availableActions(): IPublicTypeComponentAction[];

    /**
     * 设置 npm 信息
     * set method for npm inforamtion
     * @param npm
     */
    setNpm: (npm: IPublicTypeNpmInfo) => void;

    /**
     * 获取元数据
     * get component metadata
     */
    getMetadata: () => IPublicTypeTransformedComponentMetadata;

    /**
     * 检测当前对应节点是否可被放置在父节点中
     * check if the current node could be placed in parent node
     * @param my 当前节点
     * @param parent 父节点
     */
    checkNestingUp: (my: Node | IPublicTypeNodeData, parent: any) => boolean;

    /**
     * 检测目标节点是否可被放置在父节点中
     * check if the target node(s) could be placed in current node
     * @param my 当前节点
     * @param parent 父节点
     */
    checkNestingDown: (
        my: Node,
        target: IPublicTypeNodeSchema | Node | IPublicTypeNodeSchema[],
    ) => boolean;

    readonly schema?: IPublicTypeProjectSchema<IPublicTypeComponentSchema>;

}
