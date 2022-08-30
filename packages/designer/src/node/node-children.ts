import { NodeData, TransformStage } from '@webank/letgo-types';
import { EventEmitter } from 'events';
import { ParentalNode, Node } from './node';

export class NodeChildren {
    private children: Node[];

    private emitter = new EventEmitter();

    /**
     * 元素个数
     */
    get size(): number {
        return this.children.length;
    }

    constructor(readonly owner: ParentalNode, data: NodeData | NodeData[]) {
        this.children = (Array.isArray(data) ? data : [data]).map((child) => {
            return this.owner.document.createNode(child);
        });
    }

    /**
     * 导出 schema
     */
    export(stage: TransformStage = TransformStage.Save): NodeData[] {
        return this.children.map((node) => {
            const data = node.export(stage);
            if (node.isLeaf() && TransformStage.Save === stage) {
                return data.children[0];
            }
            return data;
        });
    }

    initParent() {
        this.children.forEach((child) => child.setParent(this.owner));
    }

    /**
     * 取得节点索引编号
     */
    indexOf(node: Node): number {
        return this.children.indexOf(node);
    }

    /**
     * 根据索引获得节点
     */
    get(index: number): Node | null {
        return this.children.length > index ? this.children[index] : null;
    }

    unlinkChild(node: Node) {
        const i = this.children.indexOf(node);
        if (i < 0) {
            return false;
        }
        this.children.splice(i, 1);
        this.emitter.emit('change', {
            type: 'unlink',
            node,
        });
    }

    deleteChild(node: Node, purge = false) {
        // 需要在从 children 中删除 node 前记录下 index，internalSetParent 中会执行删除(unlink)操作
        const i = this.children.indexOf(node);
        if (purge) {
            node.setParent(null);
            try {
                node.purge();
            } catch (err) {
                console.error(err);
            }
        }
        this.emitter.emit('change', {
            type: 'delete',
            node,
        });
        // purge 为 true 时，已在 internalSetParent 中删除了子节点
        if (i > -1 && !purge) {
            this.children.splice(i, 1);
        }
    }

    private purged = false;

    /**
     * 回收销毁
     */
    purge() {
        if (this.purged) {
            return;
        }
        this.purged = true;
        this.children.forEach((child) => {
            child.purge();
        });
    }
}
