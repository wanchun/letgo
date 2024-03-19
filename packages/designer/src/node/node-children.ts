import { EventEmitter } from 'eventemitter3';
import type {
    IPublicChildrenChangeOptions,
    IPublicModelNodeChildren,
    IPublicTypeNodeData,
} from '@webank/letgo-types';
import {
    IPublicEnumTransformStage,
    isNodeSchema,
} from '@webank/letgo-types';
import { markComputed, markShallowReactive } from '@webank/letgo-common';
import type { INode } from '../types';

type IterableArray = NodeChildren | any[];

export function foreachReverse(
    arr: IterableArray,
    action: (item: any) => void,
    getter: (arr: IterableArray, index: number) => any,
    context: any = {},
) {
    for (let i = arr.length - 1; i >= 0; i--)
        action.call(context, getter(arr, i));
}

export class NodeChildren implements IPublicModelNodeChildren<INode> {
    private children: INode[];

    private emitter = new EventEmitter();

    private purged = false;

    /**
     * 是否销毁
     */
    get isPurged() {
        return this.purged;
    }

    /**
     * 元素个数
     */
    get size(): number {
        return this.children.length;
    }

    get length(): number {
        return this.size;
    }

    constructor(readonly owner: INode, data?: IPublicTypeNodeData | IPublicTypeNodeData[]) {
        markShallowReactive(this, {
            children: [],
        });
        markComputed(this, ['size']);
        if (data) {
            this.children = (Array.isArray(data) ? data : [data]).map(
                (child) => {
                    return this.owner.document.createNode(child);
                },
            );
        }
    }

    export(stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save): IPublicTypeNodeData[] {
        return this.children.map((node) => {
            const data = node.exportSchema(stage);
            if (node.isLeaf() && IPublicEnumTransformStage.Save === stage)
                return data.children as IPublicTypeNodeData;

            return data;
        });
    }

    import(data?: IPublicTypeNodeData | IPublicTypeNodeData[]) {
        data = data ? (Array.isArray(data) ? data : [data]) : [];

        const originChildren = this.children.slice();
        this.children.forEach(child => child.setParent(null));

        const children: INode[] = Array.from({ length: data.length });
        for (let i = 0, l = data.length; i < l; i++) {
            const child = originChildren[i];
            const item = data[i];

            let node: INode | undefined;
            if (
                isNodeSchema(item)
                && child
                && child.componentName === item.componentName
            ) {
                node = child;
                node.importSchema(item);
            }
            else {
                node = this.owner.document.createNode(item);
            }
            children[i] = node;
        }

        this.children = children;
        this.initParent();
        this.emitter.emit('change');
    }

    initParent() {
        this.children.forEach(child => child.setParent(this.owner));
    }

    /**
     * 取得节点索引编号
     */
    indexOf(node: INode): number {
        return this.children.indexOf(node);
    }

    /**
     * 根据索引获得节点
     */
    get(index: number): INode | null {
        return this.children.length > index
            ? this.children[index]
            : null;
    }

    /**
     * 把子节点从当前节点移出，但不删除
     */
    unlinkChild(node: INode) {
        const i = this.children.indexOf(node);
        if (i < 0)
            return;

        const children = this.children.slice();
        children.splice(i, 1);
        this.children = children;
        this.emitter.emit('change', {
            type: 'unlink',
            node,
        });
    }

    /**
     * 删除一个子节点
     */
    deleteChild(node: INode, purge = false) {
        if (node.isParental()) {
            foreachReverse(
                node.children,
                (subNode: INode) => {
                    subNode.remove(purge);
                },
                (iterable, idx) => (iterable as NodeChildren).get(idx),
            );
            foreachReverse(
                node.slots,
                (slotNode: INode) => {
                    slotNode.remove(purge);
                },
                (iterable, idx) => (iterable as [])[idx],
            );
        }

        if (purge) {
            try {
                node.purge();
            }
            catch (err) {
                console.error(err);
            }
        }

        const { document } = node;
        document.removeNode(node);
        document.selection.remove(node.id);

        // 需要在从 children 中删除 node 前记录下 index，internalSetParent 中会执行删除(unlink)操作
        const i = this.indexOf(node);
        if (i > -1) {
            const children = this.children.slice();
            children.splice(i, 1);
            this.children = children;
        }

        this.emitter.emit('change', {
            type: 'delete',
            node,
        });
    }

    /**
     * 插入一个子节点
     */
    insertChild(node: INode, at?: number | null): void {
        const children = this.children.slice();
        let index = (at == null || at === -1) ? children.length : at;

        const i = children.indexOf(node);

        if (i < 0) {
            if (index < children.length)
                children.splice(index, 0, node);

            else
                children.push(node);

            node.setParent(this.owner);
        }
        else {
            if (index > i)
                index -= 1;

            if (index === i)
                return;

            children.splice(i, 1);
            children.splice(index, 0, node);
        }

        this.children = children;

        this.emitter.emit('change', {
            type: 'insert',
            node,
        });
    }

    /**
     * 是否没有子节点
     */
    isEmpty() {
        return this.size < 1;
    }

    /**
     * 回收销毁
     */
    purge() {
        if (this.purged)
            return;

        this.purged = true;
        this.children.forEach((child) => {
            child.purge();
        });
        this.emitter.removeAllListeners();
    }

    /**
     * 获取子节点
     */
    getNodes() {
        return this.children;
    }

    onChange(fn: (info?: IPublicChildrenChangeOptions) => void): () => void {
        this.emitter.on('change', fn);
        return () => {
            this.emitter.off('change', fn);
        };
    }
}
