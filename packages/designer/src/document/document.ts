import { uniqueId } from '@webank/letgo-utils';
import { RootSchema } from '@webank/letgo-types';
import { EventEmitter } from 'events';
import { RootNode, ISimulator, GetDataType } from '../types';
import { Designer } from '../designer';
import { Project } from '../project';
import { Node } from '../node/node';
import { Selection } from './selection';

export class Document {
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
        return this.rootNode?.schema as any;
    }

    get fileName(): string {
        return (
            this.rootNode?.getExtraProp('fileName', false)?.getAsString() ||
            this.id
        );
    }

    set fileName(fileName: string) {
        this.rootNode?.getExtraProp('fileName', true)?.setValue(fileName);
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

    constructor(project: Project, schema?: RootSchema) {
        this.project = project;
        this.designer = this.project?.designer;

        if (!schema) {
            this._blank = true;
        }

        // // 兼容 vision
        // this.id = project.getSchema()?.id || this.id;

        // this.rootNode = this.createNode<RootNode>(
        //     schema || {
        //         componentName: 'Page',
        //         id: 'root',
        //         fileName: '',
        //     },
        // );

        this.isMounted = true;
    }

    /**
     * 从项目中移除
     */
    destroy() {
        this.designer.postEvent('document.destroy', { id: this.id });
        this.purge();
        this.project.removeDocument(this);
    }

    purge() {
        this.rootNode?.purge();
        this.nodes.clear();
        this._nodesMap.clear();
        this.rootNode = null;
    }

    isBlank() {
        return this._blank;
    }

    /**
     * 根据 schema 创建一个节点
     */
    createNode<T extends Node = Node, C = undefined>(
        data: GetDataType<C, T>,
        checkId = true,
    ): T {}

    /**
     * 移除一个节点
     */
    removeNode(idOrNode: string | Node) {}

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
}
