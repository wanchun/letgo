import { FInput } from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import { FigmaComponent, Page, Plug } from '@icon-park/vue-next';
import type { Designer, INode } from '@webank/letgo-designer';
import { canMoveNode, getClosestNode, insertChild } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { isLocationChildrenDetail } from '@webank/letgo-types';
import type { PropType, Ref } from 'vue';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    ref,
    shallowRef,
} from 'vue';
import './component-tree.less';
import { MODAL_VIEW_VALUE, type DropInfo, type TreeNode } from './components/const';
import { TreeView } from './components/tree';
import { SuffixView } from './suffix';

function transformNode(node: INode, isSlot: boolean, modalRoot?: TreeNode): TreeNode {
    if (!node)
        return;
    const option: TreeNode = {
        value: node.id,
        label: `${node.ref} - ${node.title || node.componentName}`,
        children: [],
    };
    if (!modalRoot) {
        modalRoot = {
            value: MODAL_VIEW_VALUE,
            label: '模态视图层',
            isContainer: true,
            draggable: false,
            checkable: false,
            isExpanded: true,
            children: [],
        };
        option.children.push(modalRoot);
    }
    option.children.push(
        ...node.slots.map(node => transformNode(node, true, modalRoot)).filter(Boolean),
    );
    option.children.push(...node.children.getNodes().map(node => transformNode(node, false, modalRoot)).filter(Boolean));

    option.prefix = () => {
        if (node.componentName === 'Page')
            return <Page class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />;

        if (isSlot)
            return <Plug class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />;

        return <FigmaComponent class="letgo-comp-tree__icon letgo-comp-tree__icon--node" theme="outline" />;
    };
    option.suffix = () => {
        return <SuffixView node={node} style={{ marginRight: '8px' }}></SuffixView>;
    };

    option.isContainer = node.isContainer();

    option.draggable = !isSlot && canMoveNode(node);

    option.checkable = !isSlot;

    if (node.isModal?.()) {
        modalRoot.children.push(option);
        return;
    }

    return option;
}

export const ContentView = defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const { designer } = props;

        let preModalOpened: INode = null;

        const isSimulatorReady: Ref<boolean> = ref(designer.isRendererReady);

        const clear = designer.onRendererReady(() => {
            isSimulatorReady.value = true;
        });

        onBeforeUnmount(clear);

        const dropInfo = shallowRef<DropInfo>();

        const data = computed(() => {
            // 必须等 RendererReady，才能正确拿到Page的schema
            if (!isSimulatorReady.value)
                return [];

            const currentRootNode = designer.currentDocument?.root;
            if (!currentRootNode)
                return [];

            return [transformNode(currentRootNode, false)];
        });

        const selectedIds = computed(() => {
            return designer.currentSelection?.getNodes().map(node => node.id) ?? [];
        });

        const clearDropLocationChange = designer.dragon.onDropLocationChange((loc) => {
            if (loc && isLocationChildrenDetail(loc.detail) && loc.detail.valid !== false) {
                const target = loc.target;
                const index = loc.detail.index;
                dropInfo.value = {
                    dropNode: {
                        value: target.id,
                        label: `${target.ref} - ${target.title || target.componentName}`,
                    },
                    dragNode: {
                        value: selectedIds.value?.[0],
                        label: selectedIds.value?.[0],
                    },
                    index,
                    isAllow: true,
                };
            }
        });

        const clearDragEnd = designer.dragon.onDragend(() => {
            dropInfo.value = null;
        });

        onBeforeUnmount(clearDropLocationChange);

        onBeforeUnmount(clearDragEnd);

        const onSelectNode = (node: TreeNode) => {
            if (!node.checkable)
                return;
            designer.currentSelection.select(node.value);
            const inst = designer.currentSelection.getNodes()?.[0];

            if (inst?.isModal?.()) {
                if (preModalOpened && preModalOpened !== inst)
                    preModalOpened.setExtraPropValue('isDialogOpen', false);
                if (inst.isDialogOpen === true)
                    designer.currentSelection.remove(node.value);

                inst.setExtraPropValue('isDialogOpen', !inst.isDialogOpen);
                preModalOpened = inst;
            }
        };

        const refTree = ref();

        const onSearch = (val: string) => {
            refTree.value.filter(val);
        };

        const filterMethod = (value: string, node: { label?: string }) => {
            return node?.label.includes(value);
        };

        const checkDrop = (dropNode: TreeNode, dragNode: TreeNode) => {
            if (dropNode?.value === dragNode?.value)
                return false;
            const document = designer.currentDocument;
            const sourceNode = document.getNode(dragNode.value);
            const containerNode = document.getNode(dropNode.value);
            if (!containerNode || !sourceNode)
                return false;

            // 如果放置节点父级有锁住的节点，则不能被放置
            const lockedNode = getClosestNode(
                containerNode,
                (node: INode) => node.isLocked,
            );
            if (lockedNode)
                return false;

            // 如果放置节点存在白名单而且拖拽节点不在白名单，则不能被放置
            const childWhitelist = containerNode?.componentMeta?.childWhitelist;
            if (typeof childWhitelist === 'function' && !childWhitelist(sourceNode))
                return false;

            // 检查父子关系是否满足Nesting配置
            if (!document.checkNestingUp(containerNode, sourceNode) || !document.checkNestingDown(containerNode, sourceNode))
                return false;

            return true;
        };

        const onDrop = ({ dropNode, dragNode, index }: { dropNode: TreeNode; dragNode: TreeNode; index: number }) => {
            const document = designer.currentDocument;
            const sourceNode = document.getNode(dragNode.value);
            const containerNode = document.getNode(dropNode.value);

            if (!checkDrop(dropNode, dragNode))
                return;

            insertChild(containerNode, sourceNode, index);
        };

        return () => {
            return (
                <div class="letgo-comp-tree">
                    <div class="letgo-comp-tree__search">
                        <FInput
                            placeholder="请输入"
                            clearable
                            onInput={onSearch}
                            v-slots={{
                                suffix: () => <SearchOutlined />,
                            }}
                        >
                        </FInput>
                    </div>
                    <TreeView
                        ref={refTree}
                        data={data.value}
                        selectedKeys={selectedIds.value}
                        onSelect={onSelectNode}
                        filterMethod={filterMethod}
                        draggable
                        onDragstart={onSelectNode}
                        onDrop={onDrop}
                        checkDrop={checkDrop}
                        v-model:dropInfo={dropInfo.value}
                    />
                </div>
            );
        };
    },
});
