import { EventEmitter } from 'eventemitter3';
import { uniqueId } from '@webank/letgo-utils';
import {
    RootSchema,
    isDOMText,
    isJSSlot,
    isJSExpression,
    NodeData,
    ComponentsMap,
    TransformStage,
    NodeSchema,
    isNodeSchema,
} from '@webank/letgo-types';
import { ComputedRef } from 'vue';
import { RootNode, ISimulator, GetDataType, ParentalNode } from '../types';
import {
    Designer,
    DragNodeObject,
    DragNodeDataObject,
    isDragNodeDataObject,
} from '../designer';
import { Project } from '../project';
import { Node, NodeOption, insertChild, insertChildren, isNode } from '../node';
import { ComponentMeta } from '../component-meta';
import { Selection } from './selection';

export class DocumentModel {
    readonly project: Project;

    readonly designer: Designer;

    // /**
    //  * 操作记录控制
    //  */
    // readonly history: History;

    /**
     * 选区控制
     */
    readonly selection: Selection = new Selection(this);

    private _nodesMap = new Map<string, Node>();

    private nodes = new Set<Node>();

    private seqId = 0;

    private emitter = new EventEmitter();

    private isMounted = false;

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
        return this.designer.simulator;
    }

    get nodesMap(): Map<string, Node> {
        return this._nodesMap;
    }

    /**
     * 导出 schema 数据
     */
    get schema(): ComputedRef<RootSchema> {
        return this.rootNode?.schema;
    }

    get fileName(): string {
        return (
            this.rootNode?.getExtraProp('fileName', false)?.getAsString() ||
            this.id
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
            return selector(this.rootNode);
        }
        return this.rootNode;
    }

    constructor(project: Project, schema?: RootSchema) {
        this.project = project;
        this.designer = this.project?.designer;

        this.rootNode = this.createNode(
            schema || {
                componentName: 'Page',
                id: 'root',
                fileName: '',
                code: '',
            },
        );

        this.isMounted = true;
    }

    export(stage: TransformStage = TransformStage.Serialize) {
        const currentSchema = this.rootNode?.export(stage);
        return currentSchema;
    }

    getComponentMeta(componentName: string): ComponentMeta {
        return this.designer.getComponentMeta(
            componentName,
            () =>
                // this.simulator?.generateComponentMetadata(componentName) ||
                null,
        );
    }

    getComponentsMap(extraComps?: string[]) {
        const componentsMap: ComponentsMap = [];
        // 组件去重
        const existingMap: { [componentName: string]: boolean } = {};
        for (const node of this._nodesMap.values()) {
            const { componentName } = node || {};
            if (componentName === 'Slot') continue;
            if (!existingMap[componentName]) {
                existingMap[componentName] = true;
                if (node.componentMeta?.npm?.package) {
                    componentsMap.push({
                        ...node.componentMeta.npm,
                        componentName,
                    });
                } else {
                    componentsMap.push({
                        devMode: 'lowCode',
                        componentName,
                    });
                }
            }
        }
        // 合并外界传入的自定义渲染的组件
        if (Array.isArray(extraComps)) {
            extraComps.forEach((c) => {
                if (c && !existingMap[c]) {
                    const m = this.getComponentMeta(c);
                    if (m && m.npm?.package) {
                        componentsMap.push({
                            ...m?.npm,
                            componentName: c,
                        });
                    }
                }
            });
        }
        return componentsMap;
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
            option.slotArgs = data.params;
            option.slotName = data.name;
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

    checkDropTarget(
        dropTarget: ParentalNode,
        dragObject: DragNodeObject | DragNodeDataObject,
    ): boolean {
        let items: Array<Node | NodeSchema>;
        if (isDragNodeDataObject(dragObject)) {
            items = Array.isArray(dragObject.data)
                ? dragObject.data
                : [dragObject.data];
        } else {
            items = dragObject.nodes;
        }
        return items.every((item) => this.checkNestingUp(dropTarget, item));
    }

    checkNesting(
        dropTarget: ParentalNode,
        dragObject: DragNodeObject | DragNodeDataObject,
    ): boolean {
        let items: Array<Node | NodeSchema>;
        if (isDragNodeDataObject(dragObject)) {
            items = Array.isArray(dragObject.data)
                ? dragObject.data
                : [dragObject.data];
        } else {
            items = dragObject.nodes;
        }
        return items.every((item) => this.checkNestingDown(dropTarget, item));
    }

    /**
     * 检查对象对父级的要求，涉及配置 parentWhitelist
     */
    checkNestingUp(parent: ParentalNode, obj: NodeSchema | Node): boolean {
        if (isNode(obj) || isNodeSchema(obj)) {
            const config = isNode(obj)
                ? obj.componentMeta
                : this.getComponentMeta(obj.componentName);
            if (config) {
                return config.checkNestingUp(obj, parent);
            }
        }

        return true;
    }

    /**
     * 检查投放位置对子级的要求，涉及配置 childWhitelist
     */
    checkNestingDown(parent: ParentalNode, obj: NodeSchema | Node): boolean {
        const config = parent.componentMeta;
        return (
            config.checkNestingDown(parent, obj) &&
            this.checkNestingUp(parent, obj)
        );
    }
}
