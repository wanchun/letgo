import { uniqueId } from '@webank/letgo-utils';
import {
    RootSchema,
    isDOMText,
    isJSSlot,
    isJSExpression,
    NodeData,
} from '@webank/letgo-types';
import { EventEmitter } from 'events';
import { RootNode, ISimulator, GetDataType } from '../types';
import { Designer } from '../designer';
import { Project } from '../project';
import {
    Node,
    NodeOption,
    ParentalNode,
    insertChild,
    insertChildren,
} from '../node/node';
import { ComponentMeta } from '../component-meta';
import { Selection } from './selection';

export class DocumentModel {
    readonly project: Project;

    readonly designer: Designer;

    /**
     * 操作记录控制
     */
    readonly history: History;

    /**
     * 选区控制
     */
    readonly selection: Selection = new Selection(this);

    private _nodesMap = new Map<string, Node>();

    private nodes = new Set<Node>();

    private seqId = 0;

    private emitter = new EventEmitter();

    private isMounted = false;

    private _blank?: boolean;

    /**
     * 根节点 类型有：Page/Component
     */
    rootNode: RootNode | null;

    /**
     * 文档编号
     */
    id: string = uniqueId('doc');

    /**
     * 模拟器
     */
    get simulator(): ISimulator | null {
        return this.project.simulator;
    }

    get nodesMap(): Map<string, Node> {
        return this._nodesMap;
    }

    /**
     * 导出 schema 数据
     */
    get schema(): RootSchema {
        return this.rootNode?.schema;
    }

    get fileName(): string {
        return (
            this.rootNode?.props
                .getExtraProp('fileName', false)
                ?.getAsString() || this.id
        );
    }

    set fileName(fileName: string) {
        this.rootNode?.props.getExtraProp('fileName', true)?.setValue(fileName);
    }

    get isActive(): boolean {
        return this.project.currentDocument.value === this;
    }

    get root() {
        return this.rootNode;
    }

    get focusNode() {
        const selector = this.designer.editor?.get<
            ((rootNode: RootNode) => Node) | null
        >('focusNodeSelector');
        if (selector && typeof selector === 'function') {
            return selector(this.rootNode!);
        }
        return this.rootNode;
    }

    isBlank() {
        return this._blank;
    }

    constructor(project: Project, schema?: RootSchema) {
        this.project = project;
        this.designer = this.project?.designer;

        if (!schema) {
            this._blank = true;
        }

        this.rootNode = this.createNode<RootNode>(
            schema || {
                componentName: 'Page',
                id: 'root',
                fileName: '',
                code: '',
            },
        );

        this.isMounted = true;
    }

    getComponentMeta(componentName: string): ComponentMeta {
        return this.designer.getComponentMeta(
            componentName,
            () =>
                // this.simulator?.generateComponentMetadata(componentName) ||
                null,
        );
    }

    /**
     * 生成唯一id
     */
    nextId(possibleId: string | undefined) {
        let id = possibleId;
        while (!id || this.nodesMap.get(id)) {
            id = `node_${(
                String(this.id).slice(-10) + (++this.seqId).toString(36)
            ).toLocaleLowerCase()}`;
        }

        return id;
    }

    /**
     * 从项目中移除
     */
    remove() {
        this.designer.postEvent('document.remove', { id: this.id });
        this.purge();
        this.project.removeDocument(this);
    }

    /**
     * 根据 schema 创建一个节点
     */
    createNode<T extends Node = Node, C = undefined>(
        data: GetDataType<C, T>,
    ): T {
        let schema: any;
        const option: NodeOption = {};
        if (isDOMText(data) || isJSExpression(data)) {
            schema = {
                componentName: 'Leaf',
                children: data,
            };
        } else if (isJSSlot(data)) {
            schema = data.value;
            option.slotArgs = data.value.args;
            option.slotName = data.value.name;
        } else {
            schema = data;
        }

        let node: Node | null = null;
        if (this.hasNode(schema?.id)) {
            schema.id = null;
        }
        node = new Node(this, schema, option);
        this._nodesMap.set(node.id, node);
        this.nodes.add(node);

        this.emitter.emit('nodeCreated', node);
        return node as any;
    }

    /**
     * 根据 id 获取节点
     */
    getNode(id: string): Node | null {
        return this._nodesMap.get(id) || null;
    }

    /**
     * 是否存在节点
     */
    hasNode(id: string): boolean {
        const node = this.getNode(id);
        return node ? !node.isPurged : false;
    }

    /**
     * 插入一个节点
     */
    insertNode(
        parent: ParentalNode,
        thing: Node | NodeData,
        at?: number | null,
        copy?: boolean,
    ): Node {
        return insertChild(parent, thing, at, copy);
    }

    /**
     * 插入多个节点
     */
    insertNodes(
        parent: ParentalNode,
        thing: Node[] | NodeData[],
        at?: number | null,
        copy?: boolean,
    ) {
        return insertChildren(parent, thing, at, copy);
    }

    /**
     * 移除一个节点
     */
    removeNode(idOrNode: string | Node) {
        let id: string;
        let node: Node | null;
        if (typeof idOrNode === 'string') {
            id = idOrNode;
            node = this.getNode(id);
        } else {
            node = idOrNode;
            id = node.id;
        }
        if (!node) {
            return;
        }
        if (!this.nodes.has(node)) {
            return;
        }
        node.remove(true);
    }

    unlinkNode(node: Node) {
        this.nodes.delete(node);
        this._nodesMap.delete(node.id);
    }

    purge() {
        this.rootNode?.purge();
        this.rootNode = null;
        this.nodes.clear();
        this._nodesMap.clear();
    }
}
