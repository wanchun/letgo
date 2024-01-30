import { FigmaComponent, Page, Plug } from '@icon-park/vue-next';
import type { PropType, Ref, VNodeChild } from 'vue';
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
import { FInput, FScrollbar, FTree } from '@fesjs/fes-design';
import { SearchOutlined } from '@fesjs/fes-design/icon';
import { SuffixView } from './suffix';
import './component-tree.less';

interface Option {
    value: string
    label: string
    children?: Option[]
    prefix?: () => VNodeChild
    suffix?: () => VNodeChild
    isLeaf?: boolean
    draggable?: boolean
}

interface DragTarget {
    target: INode
    index: number
}

function transformNode(node: INode, isSlot: boolean, dragTarget?: DragTarget): Option {
    const option: Option = {
        value: node.id,
        label: `${node.ref} - ${node.title || node.componentName}`,
    };
    option.children = [
        ...node.slots.map(node => transformNode(node, true, dragTarget)),
        ...node.children.getNodes().map(node => transformNode(node, false, dragTarget)),
    ];
    // 此节点是拖入目标
    if (dragTarget && node.id === dragTarget.target.id) {
        option.children.splice(dragTarget.index, 0, {
            value: '',
            label: '',
            prefix: () => {
                return <div class="letgo-comp-tree-drag" style={{ left: `${(node.zLevel + 1) * 16}px` }}></div>;
            },
        });
    }

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
    option.isLeaf = !node.isContainer;

    option.draggable = canMoveNode(node);

    return option;
}

export const TreeView = defineComponent({
    props: {
        editor: {
            type: Object as PropType<Editor>,
        },
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const isSimulatorReady: Ref<boolean> = ref(props.designer.isRendererReady);

        const clear = props.designer.onRendererReady(() => {
            isSimulatorReady.value = true;
        });

        onBeforeUnmount(clear);

        const dragTargetRef = shallowRef<DragTarget>();

        const clearDropLocationChange = props.designer.dragon.onDropLocationChange((loc) => {
            if (loc && isLocationChildrenDetail(loc.detail) && loc.detail.valid !== false) {
                const target = loc.target;
                const index = loc.detail.index;
                dragTargetRef.value = {
                    target,
                    index,
                };
            }
        });

        onBeforeUnmount(clearDropLocationChange);

        const data = computed(() => {
            // 必须等 RendererReady，才能正确拿到Page的schema
            if (!isSimulatorReady.value)
                return [];

            const currentRootNode = props.designer.currentDocument?.root;
            if (!currentRootNode)
                return [];

            return [transformNode(currentRootNode, false, dragTargetRef.value)];
        });

        const selectedIds = computed(() => {
            return props.designer.currentSelection?.getNodes().map(node => node.id) ?? [];
        });

        const onSelectNode = ({ node }: { node: { value: string } }) => {
            props.designer.currentSelection.select(node.value);
        };

        const refTree = ref();

        const onSearch = (val: string) => {
            refTree.value.filter(val);
        };

        const filterMethod = (value: string, node: { label?: string }) => {
            return node?.label.includes(value);
        };

        const onDrop = ({ originNode, originDragNode, position }: { originNode: Option, originDragNode: Option, position: 'before' | 'after' | 'inside' }) => {
            const document = props.designer.currentDocument;
            const targetNode = document.getNode(originNode.value);
            if ((position === 'before' || position === 'after') && targetNode.componentName === 'Page')
                return;

            const dragNode = document.getNode(originDragNode.value);
            let containerNode: INode;
            let index: number;
            if (position === 'inside') {
                containerNode = targetNode;
                index = 0;
            }
            else if (position === 'before') {
                containerNode = targetNode.parent;
                index = targetNode.parent.children.indexOf(targetNode);
            }
            else if (position === 'after') {
                containerNode = targetNode.parent;
                index = targetNode.parent.children.indexOf(targetNode) + 1;
            }

            // 如果放置节点父级有锁住的节点，则不能被放置
            const lockedNode = getClosestNode(
                containerNode,
                (node: INode) => node.isLocked,
            );
            if (lockedNode)
                return;

            // 如果放置节点存在白名单而且拖拽节点不在白名单，则不能被放置
            const childWhitelist = containerNode?.componentMeta?.childWhitelist;
            if (typeof childWhitelist === 'function' && !childWhitelist(dragNode))
                return;

            // 检查父子关系是否满足Nesting配置
            if (!document.checkNestingUp(containerNode, dragNode) || !document.checkNestingDown(containerNode, dragNode))
                return;

            insertChild(containerNode, dragNode, index);
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
                    <FScrollbar class="letgo-comp-tree__body" contentStyle={{ marginTop: '8px' }}>
                        <FTree
                            ref={refTree}
                            data={data.value}
                            selectedKeys={selectedIds.value}
                            onSelect={onSelectNode}
                            filterMethod={filterMethod}
                            defaultExpandAll
                            draggable
                            onDrop={onDrop}
                        />
                    </FScrollbar>
                </div>
            );
        };
    },
});
