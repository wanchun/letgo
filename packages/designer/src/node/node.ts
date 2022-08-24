import {
    NodeSchema,
    PageSchema,
    ComponentSchema,
    GlobalEvent,
    isDOMText,
    isJSExpression,
} from '@webank/letgo-types';
import { EventEmitter } from 'events';
import {} from 'vue';
import { ComponentMeta } from '../component-meta';
import { Document } from '../document';
import { NodeChildren } from './node-children';
import { Props } from './props';

export interface NodeOption {
    slotName?: string;
    slotArgs?: string;
}

export type PropChangeOptions = Omit<
    GlobalEvent.Node.Prop.ChangeOptions,
    'node'
>;

export interface ParentalNode<T extends NodeSchema = NodeSchema>
    extends Node<T> {
    readonly children: NodeChildren;
}

export interface LeafNode extends Node {
    readonly children: null;
}

export type PageNode = ParentalNode<PageSchema>;

export type ComponentNode = ParentalNode<ComponentSchema>;

export type RootNode = PageNode | ComponentNode;

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
     * 节点是插槽的话，插槽名称
     */
    readonly slotName: string;

    /**
     * 节点是插槽的话，插槽参数
     */
    readonly slotArgs: string;

    private _children?: NodeChildren;

    private _parent: ParentalNode | null = null;

    /**
     * 属性抽象
     */
    props: Props;

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

    get componentMeta(): ComponentMeta {
        return this.document.getComponentMeta(this.componentName);
    }

    constructor(
        readonly document: Document,
        nodeSchema: Schema,
        option: NodeOption,
    ) {
        const { componentName, id, children, props, ...extras } = nodeSchema;
        this.id = document.nextId(id);
        this.componentName = componentName;
        this.slotArgs = option.slotArgs;
        this.slotName = option.slotName;
        if (this.componentName === 'Leaf') {
            this.props = new Props(this, {
                children:
                    children.length === 1 &&
                    (isDOMText(children[0]) || isJSExpression(children[0]))
                        ? children[0]
                        : '',
            });
        } else {
            this.props = new Props(this, props, extras);
            this._children = new NodeChildren(this as ParentalNode, children);
            this._children.initParent();
        }
    }

    setParent(parent: ParentalNode | null) {
        if (this._parent === parent) {
            return;
        }

        // 解除老的父子关系，但不需要真的删除节点
        if (this._parent) {
            this._parent.children.unlinkChild(this);
        }

        if (parent) {
            // 建立新的父子关系
            this._parent = parent;
        }
    }

    emitPropChange(val: PropChangeOptions) {
        this.emitter?.emit('propChange', val);
    }

    remove(purge = true) {
        if (this._parent) {
            this._parent._children?.deleteChild(this, purge);
        }
    }

    setVisible(visible: boolean) {}

    private purged = false;

    /**
     * 是否已销毁
     */
    get isPurged() {
        return this.purged;
    }

    purge() {
        if (this.purged) {
            return;
        }
        this.purged = true;
        this.props.purge();
        // this.settingEntry?.purge();
    }
}

export function isNode(node: any): node is Node {
    return node && node.isNode;
}

export function isRootNode(node: Node): node is RootNode {
    return node && node.isRoot();
}