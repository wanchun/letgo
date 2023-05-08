import { EventEmitter } from 'eventemitter3';
import { uniqueId } from '@webank/letgo-utils';
import type {
    IPublicTypeComponentsMap,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isDOMText,
    isJSExpression,
    isNodeSchema,
} from '@webank/letgo-types';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import { camelCase } from 'lodash-es';
import type { INode, IRootNode, ISimulator } from '../types';
import type {
    Designer,
    IDragNodeDataObject,
    IDragNodeObject,
} from '../designer';
import {
    isDragNodeDataObject,
} from '../designer';
import type { Project } from '../project';
import { Node, insertChild, insertChildren, isNode } from '../node';
import type { ComponentMeta } from '../component-meta';
import { Selection } from './selection';

const componentUseTimes: Record<string, number> = {};

type TypeGetData<T, NodeType> = T extends undefined
    ? NodeType extends {
        schema: infer R
    }
        ? R
        : any
    : T;

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

    private _nodesMap = new Map<string, INode>();

    private nodes = new Set<INode>();

    private emitter = new EventEmitter();

    private isMounted = false;

    /**
     * 根节点 类型有：Page/Component
     */
    rootNode: IRootNode | null;

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

    get nodesMap(): Map<string, INode> {
        return this._nodesMap;
    }

    /**
     * 导出 schema 数据
     */
    get schema(): ComputedRef<IPublicTypeRootSchema> {
        return this.rootNode?.schema;
    }

    get fileName(): string {
        return (
            this.rootNode?.getExtraProp('fileName', false)?.getAsString()
            || this.id
        );
    }

    set fileName(fileName: string) {
        this.rootNode?.props.getExtraProp('fileName', true)?.setValue(fileName);
    }

    get isActive() {
        return computed(() => {
            return this.project.currentDocument.value === this;
        });
    }

    get root() {
        return this.rootNode;
    }

    get focusNode() {
        const selector = this.designer.editor?.get<
        ((rootNode: IRootNode) => INode) | null
            >('focusNodeSelector');
        if (selector && typeof selector === 'function')
            return selector(this.rootNode);

        return this.rootNode;
    }

    constructor(project: Project, schema?: IPublicTypeRootSchema) {
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

    export(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Serialize) {
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
        const componentsMap: IPublicTypeComponentsMap = [];
        // 组件去重
        const existingMap: { [componentName: string]: boolean } = {};
        for (const node of this._nodesMap.values()) {
            const { componentName } = node || {};
            if (componentName === 'Slot')
                continue;
            if (!existingMap[componentName]) {
                existingMap[componentName] = true;
                if (node.componentMeta?.npm?.package) {
                    componentsMap.push({
                        ...node.componentMeta.npm,
                        componentName,
                    });
                }
                else {
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
    nextId(possibleId: string | undefined, componentName: string) {
        let id = possibleId;

        // 如果没有id，或者id已经被使用，则重新生成一个新的
        while (!id || this.nodesMap.get(id)) {
            const count = componentUseTimes[componentName] || 1;
            id = `${camelCase(componentName)}${count}`;
            componentUseTimes[componentName] = count + 1;
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
    createNode<T extends INode = INode, C = undefined>(
        data: TypeGetData<C, T>,
    ): T {
        let schema: any;
        if (isDOMText(data) || isJSExpression(data)) {
            schema = {
                componentName: 'Leaf',
                children: data,
            };
        }
        else {
            schema = data;
        }

        let node: INode | null = null;
        if (this.hasNode(schema?.id))
            schema.id = null;

        if (schema.id) {
            node = this.getNode(schema.id);
            if (node && node.componentName === schema.componentName)
                node.import(schema);

            else if (node)
                node = null;
        }

        if (!node)
            node = new Node(this, schema);

        this._nodesMap.set(node.id, node);
        this.nodes.add(node);

        this.emitter.emit('nodeCreated', node);
        return node as any;
    }

    /**
     * 根据 id 获取节点
     */
    getNode(id: string): INode | null {
        return this._nodesMap.get(id) || null;
    }

    findNode(isMatch: (node: INode) => Boolean): INode | null {
        for (const node of this.nodes) {
            if (isMatch(node))
                return node;
        }
        return null;
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
        parent: INode,
        thing: INode | IPublicTypeNodeData,
        at?: number | null,
        copy?: boolean,
    ): INode {
        return insertChild(parent, thing, at, copy);
    }

    /**
     * 插入多个节点
     */
    insertNodes(
        parent: INode,
        thing: INode[] | IPublicTypeNodeData[],
        at?: number | null,
        copy?: boolean,
    ) {
        return insertChildren(parent, thing, at, copy);
    }

    /**
     * 移除一个节点
     */
    removeNode(idOrNode: string | INode) {
        let id: string;
        let node: INode | null;
        if (typeof idOrNode === 'string') {
            id = idOrNode;
            node = this.getNode(id);
        }
        else {
            node = idOrNode;
            id = node.id;
        }
        if (!node)
            return;

        if (!this.nodes.has(node))
            return;

        node.remove(true);
    }

    unlinkNode(node: INode) {
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
        dropTarget: INode,
        dragObject: IDragNodeObject | IDragNodeDataObject,
    ): boolean {
        let items: Array<INode | IPublicTypeNodeSchema>;
        if (isDragNodeDataObject(dragObject)) {
            items = Array.isArray(dragObject.data)
                ? dragObject.data
                : [dragObject.data];
        }
        else {
            items = dragObject.nodes;
        }
        return items.every(item => this.checkNestingUp(dropTarget, item));
    }

    checkNesting(
        dropTarget: INode,
        dragObject: IDragNodeObject | IDragNodeDataObject,
    ): boolean {
        let items: Array<INode | IPublicTypeNodeSchema>;
        if (isDragNodeDataObject(dragObject)) {
            items = Array.isArray(dragObject.data)
                ? dragObject.data
                : [dragObject.data];
        }
        else {
            items = dragObject.nodes;
        }
        return items.every(item => this.checkNestingDown(dropTarget, item));
    }

    /**
     * 检查对象对父级的要求，涉及配置 parentWhitelist
     */
    checkNestingUp(parent: INode, obj: IPublicTypeNodeSchema | INode): boolean {
        if (isNode(obj) || isNodeSchema(obj)) {
            const config = isNode(obj)
                ? obj.componentMeta
                : this.getComponentMeta(obj.componentName);
            if (config)
                return config.checkNestingUp(obj, parent);
        }

        return true;
    }

    /**
     * 检查投放位置对子级的要求，涉及配置 childWhitelist
     */
    checkNestingDown(parent: INode, obj: IPublicTypeNodeSchema | INode): boolean {
        const config = parent.componentMeta;
        return (
            config.checkNestingDown(parent, obj)
            && this.checkNestingUp(parent, obj)
        );
    }
}
