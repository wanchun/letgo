import { FigmaComponent, Page, Plug } from '@icon-park/vue-next';
import type { PropType, Ref } from 'vue';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    ref,
    shallowRef,
} from 'vue';
import { canMoveNode, getClosestNode, insertChild } from '@webank/letgo-designer';
import { isLocationChildrenDetail } from '@webank/letgo-types';
import type { Designer, INode } from '@webank/letgo-designer';
import type { Editor } from '@webank/letgo-editor-core';
import { FInput } from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import { SuffixView } from './suffix';
import './component-tree.less';
import { TreeView } from './components/tree';
import type { DropInfo, TreeNode } from './components/const';

function transformNode(node: INode, isSlot: boolean): TreeNode {
    const option: TreeNode = {
        value: node.id,
        label: `${node.ref} - ${node.title || node.componentName}`,
    };
    option.children = [
        ...node.slots.map(node => transformNode(node, true)),
        ...node.children.getNodes().map(node => transformNode(node, false)),
    ];

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

    option.draggable = canMoveNode(node);

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

        const isSimulatorReady: Ref<boolean> = ref(designer.isRendererReady);

        const clear = designer.onRendererReady(() => {
            isSimulatorReady.value = true;
        });

        onBeforeUnmount(clear);

        const dropInfo = shallowRef<DropInfo>();

        const clearDropLocationChange = designer.dragon.onDropLocationChange((loc) => {
            if (loc && isLocationChildrenDetail(loc.detail) && loc.detail.valid !== false) {
                const target = loc.target;
                const index = loc.detail.index;
                dropInfo.value = {
                    dropNode: {
                        value: target.id,
                        label: `${target.ref} - ${target.title || target.componentName}`,
                    },
                    index,
                    isAllow: true,
                };
            }
        });

        onBeforeUnmount(clearDropLocationChange);

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

        const onSelectNode = (node: TreeNode) => {
            designer.currentSelection.select(node.value);
        };

        const refTree = ref();

        const onSearch = (val: string) => {
            refTree.value.filter(val);
        };

        const filterMethod = (value: string, node: { label?: string }) => {
            return node?.label.includes(value);
        };

        const checkDrop = (dropNode: TreeNode, dragNode: TreeNode) => {
            const document = designer.currentDocument;
            const sourceNode = document.getNode(dragNode.value);
            const containerNode = document.getNode(dropNode.value);

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

        const onDrop = ({ dropNode, dragNode, index }: { dropNode: TreeNode, dragNode: TreeNode, index: number }) => {
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
