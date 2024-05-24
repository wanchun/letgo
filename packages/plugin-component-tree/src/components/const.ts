import type { ComputedRef, InjectionKey, Ref, VNodeChild } from 'vue';

export type TreeNodeKey = string;

export interface TreeNode {
    value: string;
    label: string;
    children?: TreeNode[];
    prefix?: () => VNodeChild;
    suffix?: () => VNodeChild;
    isContainer?: boolean;
    draggable?: boolean;
    isExpanded?: boolean;
    vNode?: boolean;
    checkable?: boolean;
}

export interface InnerTreeNode extends TreeNode {
    indexPath: string[];
    parent?: InnerTreeNode;
    origin: TreeNode;
}

export interface DropInfo {
    dropNode: TreeNode;
    dragNode?: TreeNode;
    index: number;
    isAllow: boolean;
}

export interface TreeInst {
    selectedKeys: ComputedRef<TreeNode['value'][]>;
    handleSelect: (node: TreeNode) => void;
    nodeMap: Map<InnerTreeNode['value'], InnerTreeNode>;
    filteredKeys: Ref<string[]>;
    draggable: ComputedRef<boolean>;
    dropInfo: Ref<DropInfo>;
}

export const TREE_PROVIDE_KEY: InjectionKey<TreeInst> = Symbol('LetgoTree');

export type DropPosition = 'before' | 'inside' | 'after';

export const MODAL_VIEW_VALUE = 'MODAL_VIEW_VALUE';
