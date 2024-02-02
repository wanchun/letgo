import type { PropType } from 'vue';
import { computed, defineComponent, provide, ref } from 'vue';
import { isFunction } from 'lodash-es';
import { useVModel } from '@vueuse/core';
import { TreeNodeView } from './node';
import type { DropInfo, InnerTreeNode, TreeNode } from './const';
import { TREE_PROVIDE_KEY } from './const';
import useDrag from './useDrag';
import './tree.less';

export const TreeView = defineComponent({
    name: 'Tree',
    props: {
        data: Array as PropType<TreeNode[]>,
        default: (): TreeNode[] => [],
        filterMethod: {
            type: Function as PropType<
                (filterText: string, node: TreeNode) => boolean
            >,
        },
        selectedKeys: Array as PropType<TreeNode['value'][]>,
        draggable: Boolean,
        dropInfo: Object as PropType<DropInfo>,
        checkDrop: Function as PropType<(dropNode: TreeNode, dragNode: TreeNode) => boolean>,
    },
    emits: ['select', 'drop', 'dragstart', 'dragover', 'drop', 'update:dropInfo'],
    setup(props, { emit, expose }) {
        const nodeMap = new Map<InnerTreeNode['value'], InnerTreeNode>();

        const dropInfo = useVModel(props, 'dropInfo', emit, {
            passive: true,
        });

        const rootRef = ref();

        const {
            dragHost,
            handleMouseDown,
        } = useDrag({ nodeMap, emit, dropInfo, props, rootRef });

        const filteredKeys = ref<string[]>([]);

        const filter = (filterText: string) => {
            const filterMethod = props.filterMethod;
            if (!isFunction(filterMethod))
                return;

            if (filterText) {
                const _filteredKeys: string[] = [];
                const filteredKeysMap = new Map<string, boolean>();
                nodeMap.forEach((item) => {
                    if (filterMethod(filterText, item)) {
                        nodeMap.get(item.value).indexPath.forEach((key) => {
                            if (!filteredKeysMap.get(key)) {
                                _filteredKeys.push(key);
                                filteredKeysMap.set(key, true);
                            }
                        });
                    }
                });
                filteredKeysMap.clear();
                filteredKeys.value = _filteredKeys;
            }
            else {
                filteredKeys.value = [];
            }
        };

        const handleSelect = (node: TreeNode) => {
            emit('select', node);
        };

        provide(TREE_PROVIDE_KEY, {
            selectedKeys: computed(() => props.selectedKeys),
            draggable: computed(() => props.draggable),
            filteredKeys,
            handleSelect,
            nodeMap,
            dropInfo,
        });

        expose({
            filter,
        });

        return () => {
            return (
                <>
                    <div
                        ref={rootRef}
                        class={['letgo-tree', dragHost.value?.node && 'is-dragging']}
                        onMousedown={(event: MouseEvent) => {
                            handleMouseDown(event);
                        }}
                    >
                        {
                            props.data.map(item => <TreeNodeView node={item} zIndex={0} />)
                        }
                    </div>
                    {
                        dragHost.value?.node && (
                            <div
                                class="letgo-tree-drag-host"
                                style={{
                                    left: `${dragHost.value?.x}px`,
                                    top: `${dragHost.value?.y}px`,
                                }}
                            >
                                {dragHost.value?.node.label}
                            </div>
                        )
                    }
                </>
            );
        };
    },
});
