import type { PropType } from 'vue';
import { computed, defineComponent, h, reactive } from 'vue';
import type { TreeProps } from '@fesjs/fes-design';
import { FTree } from '@fesjs/fes-design';

import type { ICodeItem, IPublicModelCode } from '@webank/letgo-types';
import { IEnumCodeType } from '@webank/letgo-types';
import { isNil } from 'lodash-es';
import { FolderIcon } from '../../icons';
import { IconMap, ResourceTypeIcon } from '../constants';
import { CodeItemActions } from './code-item-actions';
import { DirectoryActions } from './directory-actions';

import './logic-list.less';

type TreeNode = TreeProps['data'][number];

function findSiblingsAndIndex(node: TreeNode, nodes: TreeNode[]): [TreeNode[], number | null] {
    if (!nodes)
        return [null, null];
    for (let i = 0; i < nodes.length; ++i) {
        const siblingNode = nodes[i];
        if (siblingNode.value === node.value)
            return [nodes, i];
        const [siblings, index] = findSiblingsAndIndex(
            node,
            siblingNode.children,
        );
        if (siblings && index !== null)
            return [siblings, index];
    }
    return [null, null];
}

/**
 * TODO
 * 1. 编辑 CodeId
 * 2. 文件夹新增逻辑
 * 3. 退拽
 */

export const LogicList = defineComponent({
    props: {
        activeId: String,
        onSelect: Function as PropType<((id?: string) => void)>,
        code: Object as PropType<IPublicModelCode>,
        searchText: String,
    },
    setup(props) {
        const codeItemsEditing = reactive<Record<string, boolean>>({});
        const onRename = (id: string) => {
            codeItemsEditing[id] = true;
            props.onSelect(id);
        };
        const onDelete = (id: string | string[]) => {
            const ids = typeof id === 'string' ? [id] : id;
            if (ids.includes(props.activeId))
                props.onSelect(null);
        };

        const onSelectCodeItemOrDirectory = (id: string) => {
            if (props.activeId === id)
                codeItemsEditing[id] = true;
            else
                props.onSelect(id);
        };

        const onTreeSelect = ({ selectedKeys }: {
            selectedKeys: string[];
        }) => {
            onSelectCodeItemOrDirectory(selectedKeys[0]);
        };

        function formatCodeItem(codeItem: ICodeItem, code: IPublicModelCode) {
            return {
                label: codeItem.id,
                value: codeItem.id,
                prefix: () => codeItem.type === IEnumCodeType.JAVASCRIPT_QUERY ? h(ResourceTypeIcon[codeItem.resourceType]) : h(IconMap[codeItem.type]),
                suffix: () => h(CodeItemActions, {
                    id: codeItem.id,
                    code,
                    onRename,
                    onSelect: onSelectCodeItemOrDirectory,
                    onDelete,
                }),
            };
        }

        function formatCodeStruct(code: IPublicModelCode) {
            const treeData: TreeNode[] = code.directories.map((item) => {
                return {
                    label: item.id,
                    value: item.id,
                    children: item.code.filter((item) => {
                        return !isNil(props.searchText) ? item.id.includes(props.searchText) : true;
                    }).map((codeItem) => {
                        return formatCodeItem(codeItem, code);
                    }),
                    prefix: () => h(FolderIcon),
                    suffix: () => h(DirectoryActions, {
                        id: item.id,
                        code,
                        onRename,
                        onDelete,
                    }),
                };
            });
            return treeData.concat(code.code.filter((item) => {
                return !isNil(props.searchText) ? item.id.includes(props.searchText) : true;
            }).map((codeItem) => {
                return formatCodeItem(codeItem, code);
            }));
        }

        const treeData = computed(() => formatCodeStruct(props.code));

        const onDrop = ({ originNode, originDragNode, position }: {
            originNode: TreeNode;
            originDragNode: TreeNode;
            position: 'before' | 'inside' | 'after';
        }) => {
            const [dragNodeSiblings, dragNodeIndex] = findSiblingsAndIndex(
                originDragNode,
                treeData.value,
            );
            if (dragNodeSiblings === null || dragNodeIndex === null)
                return;
            dragNodeSiblings.splice(dragNodeIndex, 1);
            if (position === 'before') {
                const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(
                    originNode,
                    treeData.value,
                );
                if (nodeSiblings === null || nodeIndex === null)
                    return;
                nodeSiblings.splice(nodeIndex, 0, originDragNode);
            }
            else if (position === 'after') {
                const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(
                    originNode,
                    treeData.value,
                );
                if (nodeSiblings === null || nodeIndex === null)
                    return;
                nodeSiblings.splice(nodeIndex + 1, 0, originDragNode);
            }
            else if (position === 'inside') {
                if (!originNode.children)
                    originNode.children = [];

                originNode.children.splice(0, 0, originDragNode);
            }
        };

        return () => {
            return (
                <div class="letgo-logic-list">
                    <FTree
                        data={treeData.value}
                        onSelect={onTreeSelect}
                        cancelable={false}
                        selectedKeys={[props.activeId]}
                        draggable
                        onDrop={onDrop}
                    />
                </div>
            );
        };
    },
});
