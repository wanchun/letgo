import { NodeSchema, GlobalEvent } from '@webank/letgo-types';
import { EventEmitter } from 'events';
import {} from 'vue';
import { Document } from '../document';
import { Props } from './props';
import { Prop } from './prop';

export type PropChangeOptions = Omit<
    GlobalEvent.Node.Prop.ChangeOptions,
    'node'
>;

export class Node<Schema extends NodeSchema = NodeSchema> {
    private emitter = new EventEmitter();

    /**
     * 是节点实例
     */
    readonly isNode = true;

    /**
     * 节点 id
     */
    readonly id: string;

    /**
     * 节点组件类型
     * 特殊节点:
     *  * Page 页面
     *  * Block 区块
     *  * Component 组件/元件
     *  * Fragment 碎片节点，无 props，有指令
     *  * Leaf 文字节点 | 表达式节点，无 props，无指令？
     *  * Slot 插槽节点，无 props，正常 children，有 slotArgs，有指令
     */
    readonly componentName: string;

    /**
     * 属性抽象
     */
    props: Props;

    private _children?: NodeChildren;

    private _parent: ParentalNode | null = null;

    /**
     * 父级节点
     */
    get parent(): ParentalNode | null {
        return this._parent;
    }

    /**
     * 当前节点子集
     */
    get children(): NodeChildren | null {
        return this._children || null;
    }

    get zLevel(): number {
        if (this._parent) {
            return this._parent.zLevel + 1;
        }
        return 0;
    }

    constructor(
        readonly document: Document,
        nodeSchema: Schema,
        options: any = {},
    ) {}

    getProp(path: string, createIfNone = true): Prop | null {
        return this.props.getProp(path, createIfNone) || null;
    }

    emitPropChange(val: PropChangeOptions) {
        this.emitter?.emit('propChange', val);
    }
}
