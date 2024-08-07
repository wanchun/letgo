import { EventEmitter } from 'eventemitter3';
import { shallowReactive } from 'vue';
import type { IPublicModelSelection } from '@webank/letgo-types';
import { EnumPositionNO, comparePosition } from '../node/node';
import type { INode } from '../types';
import type { DocumentModel } from './document-model';

export class Selection implements IPublicModelSelection<INode> {
    private emitter = new EventEmitter();

    private _selected: string[] = shallowReactive([]);

    constructor(readonly doc: DocumentModel) {}
    /**
     * 选中的节点 id
     */
    get selected(): string[] {
        return this._selected;
    }

    /**
     * 添加选中
     */
    add(id: string) {
        if (this._selected.includes(id))
            return;

        this._selected.push(id);
        this.emitter.emit('selectionchange', this._selected);
    }

    /**
     * 切换选中
     */
    select(id: string) {
        if (this._selected.length === 1 && this._selected.includes(id)) {
            // avoid cause reaction
            return;
        }
        this.selectAll([id]);
    }

    /**
     * 批量选中
     */
    selectAll(ids: string[]) {
        this._selected.length = 0;
        for (let i = 0; i < ids.length; i++)
            this._selected.push(ids[i]);

        this.emitter.emit('selectionchange', this._selected);
    }

    /**
     * 清除选中
     */
    clear() {
        if (this._selected.length < 1)
            return;

        this._selected.length = 0;
        this.emitter.emit('selectionchange', this._selected);
    }

    /**
     * 整理选中
     */
    dispose() {
        const l = this._selected.length;
        let i = l;
        while (i-- > 0) {
            const id = this._selected[i];
            if (!this.doc.hasNode(id))
                this._selected.splice(i, 1);
        }
        if (this._selected.length !== l)
            this.emitter.emit('selectionchange', this._selected);
    }

    /**
     * 是否选中
     */
    has(id: string) {
        return this._selected.includes(id);
    }

    /**
     * 移除选中
     */
    remove(id: string) {
        const i = this._selected.indexOf(id);
        if (i > -1) {
            this._selected.splice(i, 1);
            this.emitter.emit('selectionchange', this._selected);
        }
    }

    /**
     * 选区是否包含节点
     */
    containsNode(node: INode, excludeRoot = false) {
        for (const id of this._selected) {
            const parent = this.doc.getNode(id);
            if (excludeRoot && parent?.contains(this.doc.focusNode))
                continue;

            if (parent?.contains(node))
                return true;
        }
        return false;
    }

    /**
     * 获取选中的节点
     */
    getNodes(): INode[] {
        const nodes = [];
        for (const id of this._selected) {
            const node = this.doc.getNode(id);
            if (node)
                nodes.push(node);
        }
        return nodes;
    }

    /**
     * 获取顶层选区节点, 场景：拖拽时，建立蒙层，只蒙在最上层
     */
    getTopNodes(includeRoot = false) {
        const nodes = [];
        for (const id of this._selected) {
            const node = this.doc.getNode(id);
            // 排除根节点
            if (!node || (!includeRoot && node.contains(this.doc.focusNode)))
                continue;

            let i = nodes.length;
            let isTop = true;
            while (i-- > 0) {
                const n = comparePosition(nodes[i], node);
                // nodes[i] contains node
                if (n === EnumPositionNO.Contains || n === EnumPositionNO.TheSame) {
                    isTop = false;
                    break;
                }
                // node contains nodes[i], delete nodes[i]
                if (n === EnumPositionNO.ContainedBy)
                    nodes.splice(i, 1);
            }
            // node is top item, push to nodes
            if (isTop)
                nodes.push(node);
        }
        return nodes;
    }

    onSelectionChange(fn: (ids: string[]) => void): () => void {
        this.emitter.on('selectionchange', fn);
        return () => {
            this.emitter.off('selectionchange', fn);
        };
    }

    purge() {
        this._selected = [];
        this.emitter.removeAllListeners();
    }
}
