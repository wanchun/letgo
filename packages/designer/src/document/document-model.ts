import { EventEmitter } from 'eventemitter3';
import { wrapWithEventSwitch } from '@webank/letgo-editor-core';
import { markComputed, uniqueId } from '@webank/letgo-common';
import type {
    IPublicModelDocumentModel,
    IPublicTypeComponentSchema,
    IPublicTypeComponentsMap,
    IPublicTypeDragNodeDataObject,
    IPublicTypeDragNodeObject,
    IPublicTypeNodeData,
    IPublicTypeNodeSchema,
    IPublicTypePageSchema,
    IPublicTypeRootSchema,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isDOMText,
    isDragNodeDataObject,
    isJSExpression,
    isNodeSchema,
} from '@webank/letgo-types';
import { camelCase } from 'lodash-es';
import type { INode, IRootNode, ISimulator } from '../types';
import type {
    Designer,
} from '../designer';
import type { Project } from '../project';
import { Node, insertChild, insertChildren, isNode } from '../node';
import type { ComponentMeta } from '../component-meta';
import { Code } from '../code/code';
import { State } from '../state/state';
import { Selection } from './selection';
import { History } from './history';

const componentUseTimes: Record<string, number> = {};
const componentRefTimes: Record<string, number> = {};

export class DocumentModel implements IPublicModelDocumentModel<Project, ComponentMeta, Selection, INode, State, Code> {
    readonly project: Project;

    readonly designer: Designer;

    readonly code: Code;
    readonly state: State;

    /**
     * 操作记录控制
     */
    readonly history: History<IPublicTypePageSchema | IPublicTypeComponentSchema>;

    /**
     * 选区控制
     */
    readonly selection: Selection = new Selection(this);

    private _nodesMap = new Map<string, INode>();

    private nodes = new Set<INode>();

    private offNodeRefChange: () => void;
    private offGlobalStateIdChange: () => void;

    private emitter = new EventEmitter();

    private isMounted = false;

    /**
     * 根节点 类型有：Page/Component
     */
    private rootNode: IRootNode | null;

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
     * 【响应式】获取 schema 数据
     */
    get computedSchema() {
        return this.exportSchema(IPublicEnumTransformStage.Save);
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
        return this.project.currentDocument === this;
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
        markComputed(this, ['computedSchema', 'isActive']);
        this.project = project;
        this.designer = this.project?.designer;
        const currentSchema = schema || {
            componentName: 'Page',
            id: 'root',
            fileName: '',
        } as IPublicTypePageSchema;
        this.code = new Code(currentSchema.code);
        this.state = new State(project, currentSchema);

        this.rootNode = this.createNode(currentSchema);

        const rootSchema = this.rootNode.computedSchema;

        this.history = new History(
            () => this.exportSchema(IPublicEnumTransformStage.Serialize),
            (schema) => {
                this.importSchema(schema || rootSchema);
                this.simulator?.rerender();
            },
            this,
        );

        this.isMounted = true;

        this.offNodeRefChange = this.onNodeRefChange((ref: string, preRef: string) => {
            this.state.changeNodeRef(ref, preRef);
            this.scopeVariableChange(ref, preRef);
        });
        this.offGlobalStateIdChange = this.project.code.onCodeIdChanged((id: string, preId: string) => {
            this.code.changeDepStateId(id, preId);
        });
    }

    /**
     * 是否已修改
     */
    isModified(): boolean {
        return this.history.isSavePoint();
    }

    scopeVariableChange(id: string, preId: string) {
        const codesInstance = this.state.codesInstance;
        if (codesInstance) {
            Object.keys(codesInstance).forEach((currentId) => {
                if (codesInstance[currentId].deps.includes(preId))
                    this.code.scopeVariableChange(currentId, id, preId);
            });
        }
    }

    private onEvent(name: string, func: (...args: any[]) => void) {
        const wrappedFunc = wrapWithEventSwitch(func);
        this.emitter.on(name, wrappedFunc);
        return () => {
            this.emitter.off(name, wrappedFunc);
        };
    }

    emitNodeRefChange(ref: string, preRef: string) {
        this.emitter.emit('nodeRefChange', ref, preRef);
    }

    onNodeRefChange = (func: (ref: string, preRef: string) => void) => {
        return this.onEvent('nodeRefChange', func);
    };

    importSchema(schema: IPublicTypeRootSchema) {
        // TODO: 暂时用饱和式删除，原因是 Slot 节点并不是树节点，无法正常递归删除
        this.nodes.forEach((node) => {
            if (node.isRoot())
                return;
            this.deleteNode(node);
        });
        this.code.initCode(schema.code);
        // 等 code 实例化滞以后再实例化 root
        setTimeout(() => {
            this.rootNode?.importSchema(schema as any);
        }, 4);
    }

    exportSchema(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Serialize) {
        const currentSchema = this.rootNode?.exportSchema(stage);
        if (currentSchema)
            currentSchema.code = this.code.codeStruct;

        return currentSchema;
    }

    getComponentMeta(componentName: string): ComponentMeta {
        return this.designer.getComponentMeta(componentName);
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
     * 生成唯一 ref
     */
    nextRef(possibleId: string | undefined, componentName: string) {
        let ref = possibleId;

        // 如果没有id，或者id已经被使用，则重新生成一个新的
        while (!ref || this.state.componentsInstance[ref]) {
            const count = componentRefTimes[componentName] || 1;
            ref = `${camelCase(componentName)}${count}`;
            componentRefTimes[componentName] = count + 1;
        }

        return ref;
    }

    /**
     * 从项目中移除
     */
    remove() {
        this.designer.editor.emit('document.remove', { id: this.id });
        this.project.removeDocument(this);
        this.purge();
    }

    /**
     * 根据 schema 创建一个节点
     */
    createNode<T = INode>(
        data: IPublicTypeNodeData,
    ): T {
        let schema: IPublicTypeNodeSchema;
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

    /**
     * 通过 isMatch 函数匹配 Node
     */
    findNode(isMatch: (node: INode) => boolean): INode | null {
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
     * 内部方法，请勿调用
     */
    internalRemoveAndPurgeNode(node: INode, useMutator = false) {
        if (!this.nodes.has(node))
            return;

        node.remove(useMutator);
    }

    /**
     * 移除一个节点
     */
    deleteNode(idOrNode: string | INode) {
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

        this.internalRemoveAndPurgeNode(node, true);
        this.removeNode(node);
    }

    /**
     * 从 doc 中移出，但是 node 还在
     * @param node
     */
    removeNode(node: INode) {
        this.nodes.delete(node);
        this._nodesMap.delete(node.id);
    }

    purge() {
        this.rootNode?.purge();
        this.rootNode = null;
        this.nodes.clear();
        this._nodesMap.clear();
        this.code.purge();
        this.state.purge();
        this.selection.purge();
        this.history.purge();
        this.offNodeRefChange();
        this.offGlobalStateIdChange();
        this.emitter.removeAllListeners();
    }

    checkDropTarget(
        dropTarget: INode,
        dragObject: IPublicTypeDragNodeObject<INode> | IPublicTypeDragNodeDataObject,
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
        dragObject: IPublicTypeDragNodeObject<INode> | IPublicTypeDragNodeDataObject,
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
