import { EventEmitter } from 'eventemitter3';
import type { IPublicTypeNodeData } from '@webank/letgo-types';
import { TransformStage, isNodeSchema } from '@webank/letgo-types';
import { shallowEqual } from '@webank/letgo-utils';
import type { ShallowRef } from 'vue';
import { shallowRef, triggerRef } from 'vue';
import type { IBaseNode } from '../types';
import type { Node } from './node';

export interface IOnChangeOptions {
    type: string
    node: Node
}

export interface NodeRemoveOptions {
    suppressRemoveEvent?: boolean
}

export class NodeChildren {
    private children: ShallowRef<Node[]> = shallowRef([]);

    private emitter = new EventEmitter();

    /**
     * 元素个数
     */
    get size(): number {
        return this.children.value.length;
    }

    constructor(readonly owner: IBaseNode, data?: IPublicTypeNodeData | IPublicTypeNodeData[]) {
        if (data) {
            this.children.value = (Array.isArray(data) ? data : [data]).map(
                (child) => {
                    return this.owner.document.createNode(child);
                },
            );
        }
    }

    export(stage: TransformStage = TransformStage.Save): IPublicTypeNodeData[] {
        return this.children.value.map((node) => {
            const data = node.export(stage);
            if (node.isLeaf() && TransformStage.Save === stage)
                return data.children as IPublicTypeNodeData;

            return data;
        });
    }

    import(data?: IPublicTypeNodeData | IPublicTypeNodeData[]) {
        data = data ? (Array.isArray(data) ? data : [data]) : [];

        const originChildren = this.children.value.slice();
        this.children.value.forEach(child => child.setParent(null));

        const children = new Array<Node>(data.length);
        for (let i = 0, l = data.length; i < l; i++) {
            const child = originChildren[i];
            const item = data[i];

            let node: Node | undefined;
            if (
                isNodeSchema(item)
                && child
                && child.componentName === item.componentName
            ) {
                node = child;
                node.import(item);
            }
            else {
                node = this.owner.document.createNode(item);
            }
            children[i] = node;
        }

        this.children.value = children;
        this.initParent();
        if (!shallowEqual(children, originChildren))
            this.emitter.emit('change');
    }

    initParent() {
        this.children.value.forEach(child => child.setParent(this.owner));
    }

    /**
     * 取得节点索引编号
     */
    indexOf(node: Node): number {
        return this.children.value.indexOf(node);
    }

    /**
     * 根据索引获得节点
     */
    get(index: number): Node | null {
        return this.children.value.length > index
            ? this.children.value[index]
            : null;
    }

    unlinkChild(node: Node) {
        const i = this.children.value.indexOf(node);
        if (i < 0)
            return;

        this.children.value.splice(i, 1);
        triggerRef(this.children);
        this.emitter.emit('change', {
            type: 'unlink',
            node,
        });
    }

    onChange(fn: (info?: IOnChangeOptions) => void): () => void {
        this.emitter.on('change', fn);
        return () => {
            this.emitter.off('change', fn);
        };
    }

    /**
     * 删除一个节点
     */
    deleteChild(node: Node, purge = false) {
        // 需要在从 children 中删除 node 前记录下 index，internalSetParent 中会执行删除(unlink)操作
        const i = this.children.value.indexOf(node);
        if (purge) {
            node.setParent(null);
            try {
                node.purge();
            }
            catch (err) {
                console.error(err);
            }
        }
        const { document } = node;
        document.unlinkNode(node);
        document.selection.remove(node.id);
        this.emitter.emit('change', {
            type: 'delete',
            node,
        });
        // purge 为 true 时，已在 internalSetParent 中删除了子节点
        if (i > -1 && !purge) {
            this.children.value.splice(i, 1);
            triggerRef(this.children);
        }
    }

    /**
     * 插入一个节点
     */
    insertChild(node: Node, at?: number | null): void {
        const { children } = this;
        let index = at == null || at === -1 ? children.value.length : at;

        const i = children.value.indexOf(node);

        if (i < 0) {
            if (index < children.value.length)
                children.value.splice(index, 0, node);

            else
                children.value.push(node);

            node.setParent(this.owner);
        }
        else {
            if (index > i)
                index -= 1;

            if (index === i)
                return;

            children.value.splice(i, 1);
            children.value.splice(index, 0, node);
        }

        triggerRef(this.children);

        this.emitter.emit('change', {
            type: 'insert',
            node,
        });
    }

    isEmpty() {
        return this.size < 1;
    }

    private purged = false;

    /**
     * 回收销毁
     */
    purge() {
        if (this.purged)
            return;

        this.purged = true;
        this.children.value.forEach((child) => {
            child.purge();
        });
    }
}
