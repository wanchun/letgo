import { NodeData } from '@webank/letgo-types';
import { EventEmitter } from 'events';
import { ParentalNode, Node } from './node';

export class NodeChildren {
    private children: Node[];

    private emitter = new EventEmitter();

    constructor(readonly owner: ParentalNode, data: NodeData | NodeData[]) {
        this.children = (Array.isArray(data) ? data : [data]).map((child) => {
            return this.owner.document.createNode(child);
        });
    }

    initParent() {
        this.children.forEach((child) => child.setParent(this.owner));
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
