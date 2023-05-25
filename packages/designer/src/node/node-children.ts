import { EventEmitter } from 'eventemitter3';
import type { IPublicTypeNodeData } from '@webank/letgo-types';
import { IPublicEnumTransformStage, isNodeSchema } from '@webank/letgo-types';
import { markComputed, markReactive, shallowEqual } from '@webank/letgo-utils';
import type { INode } from '../types';

interface IOnChangeOptions {
    type: string
    node: INode
}

export class NodeChildren {
    private children: INode[];

    private emitter = new EventEmitter();

    /**
     * 元素个数
     */
    get size(): number {
        return this.children.length;
    }

    constructor(readonly owner: INode, data?: IPublicTypeNodeData | IPublicTypeNodeData[]) {
        markReactive(this, {
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
            const data = node.export(stage);
            if (node.isLeaf() && IPublicEnumTransformStage.Save === stage)
                return data.children as IPublicTypeNodeData;

            return data;
        });
    }

    import(data?: IPublicTypeNodeData | IPublicTypeNodeData[]) {
        data = data ? (Array.isArray(data) ? data : [data]) : [];

        const originChildren = this.children.slice();
        this.children.forEach(child => child.setParent(null));

        const children = new Array<INode>(data.length);
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
                node.import(item);
            }
            else {
                node = this.owner.document.createNode(item);
            }
            children[i] = node;
        }

        this.children = children;
        this.initParent();
        if (!shallowEqual(children, originChildren))
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

    unlinkChild(node: INode) {
        const i = this.children.indexOf(node);
        if (i < 0)
            return;

        const children = [...this.children];
        children.splice(i, 1);
        this.children = children;
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
    deleteChild(node: INode, purge = false) {
        // 需要在从 children 中删除 node 前记录下 index，internalSetParent 中会执行删除(unlink)操作
        const i = this.children.indexOf(node);
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
            // TODO: 可能不触发响应
            const children = [...this.children];
            children.splice(i, 1);
            this.children = children;
        }
    }

    /**
     * 插入一个节点
     */
    insertChild(node: INode, at?: number | null): void {
        const children = [...this.children];
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
        this.children.forEach((child) => {
            child.purge();
        });
    }
}
