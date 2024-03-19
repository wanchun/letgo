import { EventEmitter } from 'eventemitter3';
import type {
    GlobalEvent,
    IBaseModelNode,
    IPublicTypeComponentSchema,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypePageSchema,
    IPublicTypePropsList,
    IPublicTypePropsMap,
    IPublicTypeSlotSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isDOMText,
    isJSExpression,
} from '@webank/letgo-types';
import { wrapWithEventSwitch } from '@webank/letgo-editor-core';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
import type { ComponentMeta } from '../component-meta';
import type { DocumentModel } from '../document';
import type { SettingTop } from '../setting';
import { includeSlot, removeSlot } from '../utils';
import { Props } from './props';
import type { Prop } from './prop';
import { NodeChildren } from './node-children';

type IPropChangeOptions = Omit<
    GlobalEvent.Node.Prop.ChangeOptions,
    'node'
>;

export interface IBaseNode<Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema> extends IBaseModelNode<DocumentModel, Schema, INode, NodeChildren, ComponentMeta, SettingTop, Props, Prop> {
    internalSetSlotFor: (slotFor: Prop | null | undefined) => void;

    isSlot: () => boolean;
}

export type IPageNode = IBaseNode<IPublicTypePageSchema>;

export type IComponentNode = IBaseNode<IPublicTypeComponentSchema>;

export type ISlotNode = IBaseNode<IPublicTypeSlotSchema>;

export type IRootNode = IPageNode | IComponentNode;

export type INode = ISlotNode | IPageNode | IComponentNode | IBaseNode;

export class Node<Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema> implements IBaseNode {
    private emitter = new EventEmitter();

    /**
     * 节点 ref
     */
    ref: string;

    /**
     * 属性抽象
     */
    props: Props;

    isRGLContainer: false;

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
     *  Page 页面
     *  Block 区块
     *  Component 组件/元件
     *  Fragment 碎片节点，无 props，有指令
     *  Leaf 文字节点 | 表达式节点，无 props，无指令？
     *  Slot 插槽节点，无 props，正常 children，有 slotArgs，有指令
     */
    readonly componentName: string;

    private _children?: NodeChildren;

    private _parent: INode | null = null;

    private _slots: INode[] = [];

    private _slotFor?: Prop | null = null;

    private purged = false;

    private _settingEntry: SettingTop;

    private offEvents: (() => void)[] = [];

    /**
     * 【响应式】获取符合搭建协议-节点 schema 结构
     */
    get computedSchema() {
        return this.exportSchema(IPublicEnumTransformStage.Save);
    }

    /**
     * 父级节点
     */
    get parent(): INode | null {
        return this._parent;
    }

    /**
     * 当前节点子集
     */
    get children(): NodeChildren | null {
        return this._children || null;
    }

    get zLevel(): number {
        if (this._parent)
            return this._parent.zLevel + 1;

        return 0;
    }

    get title(): string {
        const t = this.getExtraProp('title');
        if (t) {
            const v = t.getAsString();
            if (v)
                return v;
        }
        return this.componentMeta.title;
    }

    get componentMeta(): ComponentMeta {
        return this.document.getComponentMeta(this.componentName);
    }

    get propsData(): IPublicTypePropsMap | IPublicTypePropsList | null {
        if (!this.isParental() || this.componentName === 'Fragment')
            return null;

        return this.props.export(IPublicEnumTransformStage.Serialize).props || null;
    }

    /**
     * 获取节点在父容器中的索引
     */
    get index(): number {
        if (!this.parent)
            return -1;

        return this.parent.children.indexOf(this as INode);
    }

    /**
     * 获取下一个兄弟节点
     */
    get nextSibling(): INode | null {
        if (!this.parent)
            return null;

        const { index } = this;
        if (index < 0)
            return null;

        return this.parent.children.get(index + 1);
    }

    /**
     * 获取上一个兄弟节点
     */
    get prevSibling(): INode | null {
        if (!this.parent)
            return null;

        const { index } = this;
        if (index < 1)
            return null;

        return this.parent.children.get(index - 1);
    }

    /**
     * 获取当前节点的锁定状态
     */
    get isLocked(): boolean {
        return !!this.getExtraProp('isLocked')?.getValue();
    }

    get settingEntry(): SettingTop {
        if (this._settingEntry)
            return this._settingEntry;
        this._settingEntry = this.document.designer.createSettingEntry([this as INode]);
        return this._settingEntry;
    }

    /**
     * 关联属性
     */
    get slotFor() {
        return this._slotFor;
    }

    get slots() {
        return this._slots;
    }

    /**
     * 是否已销毁
     */
    get isPurged() {
        return this.purged;
    }

    constructor(readonly document: DocumentModel, nodeSchema: Schema) {
        markShallowReactive(this, {
            _parent: null,
            ref: '',
            _slots: [],
        });
        markComputed(this, ['computedSchema', 'isLocked']);

        const { componentName, id, ref, children, props, ...extras } = nodeSchema;
        this.id = document.nextId(id, componentName);
        this.ref = ref || document.nextRef(ref, componentName);
        this.componentName = componentName;
        if (this.componentName === 'Leaf') {
            this.props = new Props(this as INode, {
                children:
                    isDOMText(children) || (isJSExpression(children)
                        ? children
                        : ''),
            });
        }
        else {
            this.props = new Props(this as INode, props, extras);
            this.props.merge(
                this.upgradeProps(this.initProps(props || {})),
                this.upgradeProps(extras),
            );
            this._children = new NodeChildren(this as INode, children);
            this._children.initParent();
        }
        this.initBuiltinProps();
    }

    private initProps(props: any): any {
        return this.document.designer.transformProps(
            props,
            this as INode,
            IPublicEnumTransformStage.Init,
        );
    }

    private upgradeProps(props: any): any {
        return this.document.designer.transformProps(
            props,
            this as INode,
            IPublicEnumTransformStage.Upgrade,
        );
    }

    private initBuiltinProps() {
        if (!this.props.hasExtra('isLocked'))
            this.props.addExtra('isLocked', false);

        if (!this.props.hasExtra('condition'))
            this.props.addExtra('condition', true);

        if (!this.props.hasExtra('loop'))
            this.props.addExtra('loop', undefined);

        this.props.hasExtra('title') || this.props.addExtra('title', '');
    }

    onCodeIdChanged(func: (id: string, preId: string) => void) {
        this.offEvents.push(this.document.code.onCodeIdChanged(func));
        this.offEvents.push(this.document.project.code.onCodeIdChanged(func));
    }

    onNodeRefChanged(func: (ref: string, preRef: string) => void) {
        this.offEvents.push(this.document.onNodeRefChange(func));
    }

    changeRef(ref: string) {
        const preRef = this.ref;
        this.ref = ref;
        this.document.emitNodeRefChange(ref, preRef);
    }

    /**
     * 获取单个属性
     */
    getProp(name: string, createIfNone = true) {
        return this.props.getProp(name, createIfNone);
    }

    /**
     * 获取其他属性
     */
    getExtraProp(name: string, createIfNone = true) {
        return this.props.getExtraProp(name, createIfNone);
    }

    /**
     * 获取单个属性值
     */
    getPropValue(path: string): any {
        return this.getProp(path, false)?.value;
    }

    /**
     * 设置单个属性值
     */
    setPropValue(path: string, value: any) {
        this.getProp(path, true).setValue(value);
    }

    getExtraPropValue(path: string): any {
        return this.getExtraProp(path, false)?.value;
    }

    setExtraPropValue(path: string, value: any) {
        this.getExtraProp(path, true).setValue(value);
    }

    setRef(ref: string) {
        if (this.document.findNode((node: INode) => node.ref === ref))
            throw new Error(`已有名为 ${ref} 的节点`);

        // TODO 变更代码变量
        // TODO 对外通知 ref
        this.ref = ref;
    }

    /**
     * 清除已设置的值
     */
    clearPropValue(path: string): void {
        this.getProp(path, false)?.unset();
    }

    /**
     * 设置多个属性值，和原有值合并
     */
    mergeProps(props: IPublicTypePropsMap) {
        this.props.merge(props);
    }

    /**
     * 设置多个属性值，替换原有值
     */
    setProps(props?: IPublicTypePropsMap | IPublicTypePropsList | Props | null) {
        if (props instanceof Props) {
            this.props = props;
            return;
        }
        this.props.import(props);
    }

    emitPropChange(val: IPropChangeOptions) {
        this.emitter.emit('propChange', val);
    }

    onPropChange(func: (info: IPropChangeOptions) => void): () => void {
        const wrappedFunc = wrapWithEventSwitch(func);
        this.emitter.on('propChange', wrappedFunc);
        const offEvent = () => {
            this.emitter.off('propChange', wrappedFunc);
        };
        this.offEvents.push(offEvent);
        return offEvent;
    }

    onChildrenChange(
        fn: (param?: { type: string; node: INode }) => void,
    ): (() => void) | undefined {
        const wrappedFunc = wrapWithEventSwitch(fn);
        return this.children?.onChange(wrappedFunc);
    }

    /**
     * 导出 schema
     */
    exportSchema(
        stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save,
        options: any = {},
    ): Schema {
        const baseSchema: any = {
            componentName: this.componentName,
        };

        if (stage !== IPublicEnumTransformStage.Clone) {
            baseSchema.id = this.id;
            baseSchema.ref = this.ref;
        }

        if (stage === IPublicEnumTransformStage.Render)
            baseSchema.docId = this.document.id;

        if (this.isLeaf()) {
            if (!options.bypassChildren)
                baseSchema.children = this.getProp('children')?.export(stage);

            return baseSchema;
        }

        const { props = {}, extras } = this.props.export(stage) || {};
        const _extras_: { [key: string]: any } = {
            ...extras,
        };

        const schema: any = {
            ...baseSchema,
            props: this.document.designer.transformProps(props, this as INode, stage),
            ...this.document.designer.transformProps(_extras_, this as INode, stage),
        };

        if (
            this.isParental()
            && this.children.size > 0
            && !options.bypassChildren
        )
            schema.children = this.children.export(stage);

        return schema;
    }

    /**
     * 导入 schema
     */
    importSchema(data: Schema) {
        const { children, props, ...extras } = data;
        if (this.isParental()) {
            this.props.import(props, extras);
            this.children.import(children);
        }
        if (this.isLeaf()) {
            this.setPropValue(
                'children',
                (isDOMText(children) || isJSExpression(children)) ? children : '',
            );
        }
    }

    setParent(parent: INode | null) {
        if (this._parent === parent)
            return;

        // 解除老的父子关系，但不需要真的删除节点
        if (this._parent) {
            if (this.isSlot())
                this._parent.removeSlot(this as INode);

            else
                this._parent.children.unlinkChild(this as INode);
        }

        if (parent) {
            // 建立新的父子关系
            this._parent = parent;
        }
    }

    /**
     * 判断是否包含特定节点
     */
    contains(node: INode): boolean {
        return contains(this as INode, node);
    }

    remove(purge = true) {
        if (this._parent) {
            if (this.isSlot()) {
                this._parent.removeSlot(this);
                this._parent.children?.deleteChild(this, purge);
            }
            else {
                this._parent.children?.deleteChild(this, purge);
            }
        }
    }

    setVisible(flag: boolean) {
        this.getExtraProp('hidden')?.setValue(!flag);
        this.emitter.emit('visibleChange', flag);
    }

    getVisible(): boolean {
        return !this.getExtraProp('hidden')?.getValue();
    }

    onVisibleChange(func: (flag: boolean) => any): () => void {
        const wrappedFunc = wrapWithEventSwitch(func);
        this.emitter.on('visibleChange', wrappedFunc);
        return () => {
            this.emitter.off('visibleChange', wrappedFunc);
        };
    }

    /**
     * 选择当前节点
     */
    select() {
        this.document.selection.select(this.id);
    }

    /**
     * 悬停高亮
     */
    hover(flag = true) {
        if (flag)
            this.document.designer.detecting.capture(this as INode);

        else
            this.document.designer.detecting.release(this as INode);
    }

    isEmpty(): boolean {
        return this.children ? this.children.isEmpty() : true;
    }

    /**
     * 获取磁贴相关信息
     */
    getRGL(): {
        isContainerNode: boolean;
        isEmptyNode: boolean;
        isRGLContainerNode: boolean;
        isRGLNode: boolean;
        isRGL: boolean;
        rglNode: INode;
    } {
        const isContainerNode = this.isContainer();
        const isEmptyNode = this.isEmpty();
        const isRGLContainerNode = this.isRGLContainer;
        const isRGLNode = this.parent?.isRGLContainer;
        const isRGL
            = isRGLContainerNode
            || (isRGLNode && (!isContainerNode || !isEmptyNode));
        const rglNode: INode | null = isRGLContainerNode
            ? this as INode
            : isRGL
                ? this.parent
                : null;
        return {
            isContainerNode,
            isEmptyNode,
            isRGLContainerNode,
            isRGLNode,
            isRGL,
            rglNode,
        };
    }

    internalSetSlotFor(slotFor: Prop | null | undefined) {
        this._slotFor = slotFor;
    }

    hasSlots() {
        return this._slots.length > 0;
    }

    removeSlot(slotNode: INode) {
        const slots = this._slots.slice(0);
        const i = slots.indexOf(slotNode);
        if (i < 0)
            return false;

        slots.splice(i, 1);
        this._slots = slots;
    }

    addSlot(slotNode: INode) {
        const slotName = slotNode?.getExtraProp('name')?.getAsString();
        // 一个组件下的所有 slot，相同 slotName 的 slot 应该是唯一的
        if (includeSlot(this as INode, slotName))
            removeSlot(this as INode, slotName);

        slotNode.setParent(this as INode);
        const slots = this._slots.slice(0);
        slots.push(slotNode);
        this._slots = slots;
    }

    /**
     * 终端节点，内容一般为 文字 或者 表达式
     */
    isLeaf() {
        return this.componentName === 'Leaf';
    }

    /**
     * 是否一个父亲类节点
     */
    isParental() {
        return !this.isLeaf();
    }

    isContainer(): boolean {
        return this.isContainerNode;
    }

    get isContainerNode(): boolean {
        return this.isParental() && this.componentMeta.isContainer;
    }

    isModal(): boolean {
        return this.componentMeta.isModal;
    }

    isRoot(): boolean {
        return this.document.root === (this as any);
    }

    isPage(): boolean {
        return this.isRoot() && this.componentName === 'Page';
    }

    isComponent(): boolean {
        return this.isRoot() && this.componentName === 'Component';
    }

    isSlot(): boolean {
        return this._slotFor != null && this.componentName === 'Slot';
    }

    /**
     * 锁住当前节点
     */
    lock(flag = true) {
        this.getExtraProp('isLocked').setValue(flag);
    }

    purge() {
        if (this.purged)
            return;

        this.purged = true;
        this.offEvents.forEach(fn => fn());
        this.props.purge();
        this.settingEntry?.purge();
        this.emitter.removeAllListeners();
        this._parent = null;
    }
}

export function isNode(node: any): node is INode {
    return node && node.isNode;
}

export function isRootNode(node: INode): node is IRootNode {
    return node && node.isRoot();
}

export function getZLevelTop(child: INode, zLevel: number): INode | null {
    let l = child.zLevel;
    if (l < zLevel || zLevel < 0)
        return null;

    if (l === zLevel)
        return child;

    let r: any = child;
    while (r && l-- > zLevel)
        r = r.parent;

    return r;
}

// 16 node1 contains node2
// 8  node1 contained_by node2
// 2  node1 before or after node2
// 0  node1 same as node2
export enum EnumPositionNO {
    Contains = 16,
    ContainedBy = 8,
    BeforeOrAfter = 2,
    TheSame = 0,
}

export function comparePosition(node1: INode, node2: INode): EnumPositionNO {
    if (node1 === node2)
        return EnumPositionNO.TheSame;

    const l1 = node1.zLevel;
    const l2 = node2.zLevel;
    if (l1 === l2)
        return EnumPositionNO.BeforeOrAfter;

    let p: any;
    if (l1 < l2) {
        p = getZLevelTop(node2, l1);
        if (p && p === node1)
            return EnumPositionNO.Contains;

        return EnumPositionNO.BeforeOrAfter;
    }

    p = getZLevelTop(node1, l2);
    if (p && p === node2)
        return EnumPositionNO.ContainedBy;

    return EnumPositionNO.BeforeOrAfter;
}

/**
 * 测试两个节点是否为包含关系
 * @param node1 测试的父节点
 * @param node2 测试的被包含节点
 * @returns 是否包含
 */
export function contains(node1: INode, node2: INode): boolean {
    if (node1 === node2)
        return true;

    if (!node1.isParental() || !node2.parent)
        return false;

    const p = getZLevelTop(node2, node1.zLevel);
    if (!p)
        return false;

    return node1 === p;
}

export function insertChild(
    container: INode,
    thing: INode | IPublicTypeNodeData,
    at?: number | null,
    copy?: boolean,
): INode {
    let node: INode;
    if (isNode(thing) && copy)
        thing = thing.exportSchema(IPublicEnumTransformStage.Clone);

    if (isNode(thing))
        node = thing;

    else
        node = container.document.createNode(thing);

    container.children.insertChild(node, at);

    return node;
}

export function insertChildren(
    container: INode,
    nodes: INode[] | IPublicTypeNodeData[],
    at?: number | null,
    copy?: boolean,
): INode[] {
    let index = at;
    let node: any;
    const results: INode[] = [];
    // eslint-disable-next-line no-cond-assign
    while ((node = nodes.pop())) {
        node = insertChild(container, node, index, copy);
        results.push(node);
        index = node.index;
    }
    return results;
}
