import { FEllipsis } from '@fesjs/fes-design';
import { CaretDownOutlined } from '@fesjs/fes-design/icon';
import { isUndefined } from 'lodash-es';
import type { PropType } from 'vue';
import { computed, defineComponent, inject, ref, watch } from 'vue';
import type { TreeNode } from './const';
import { MODAL_VIEW_VALUE, TREE_PROVIDE_KEY } from './const';

export const TreeNodeView = defineComponent({
    name: 'Tree',
    props: {
        node: Object as PropType<TreeNode>,
        zIndex: Number,
        parentPath: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        },
    },
    setup(props) {
        const {
            selectedKeys,
            handleSelect,
            nodeMap,
            filteredKeys,
            dropInfo,
        } = inject(TREE_PROVIDE_KEY);

        const isExpanded = ref(isUndefined(props.node.isExpanded) ? true : props.node.isExpanded);

        const isSelected = computed(() => {
            return selectedKeys.value.includes(props.node.value);
        });

        const isDragNode = computed(() => {
            return dropInfo.value?.dragNode?.value === props.node.value;
        });

        const isDropNode = computed(() => {
            return dropInfo.value?.dropNode?.value === props.node.value;
        });

        const isShow = computed(() => {
            // 存在过滤后需要显示的key
            if (filteredKeys.value.length)
                return filteredKeys.value.includes(props.node.value);

            return true;
        });

        // 是否是模态视图层
        const isModalView = computed(() => {
            return props.node.value === MODAL_VIEW_VALUE;
        });

        watch(() => props.node.isExpanded, () => {
            isExpanded.value = isUndefined(props.node.isExpanded) ? true : props.node.isExpanded;
        });

        watch([() => props.node, () => props.parentPath], () => {
            if (props.node.vNode)
                return;

            nodeMap.set(props.node.value, {
                ...props.node,
                origin: props.node,
                parent: nodeMap.get(props.parentPath[props.parentPath.length - 1]),
                indexPath: [...props.parentPath, props.node.value],
            });
        }, {
            immediate: true,
        });

        const children = computed(() => {
            const { node } = props;
            if (node.vNode)
                return [];

            const oldChildren = node.children ?? [];

            if (dropInfo.value?.dropNode?.value === node.value) {
                const { index } = dropInfo.value;
                const arr = [...oldChildren];
                arr.splice(index, 0, {
                    value: '',
                    label: '',
                    isContainer: false,
                    draggable: false,
                    isExpanded: false,
                    vNode: true,
                });
                return arr;
            }

            return oldChildren;
        });

        const handleClickSwitcher = () => {
            isExpanded.value = !isExpanded.value;
        };

        const renderChildren = () => {
            const { node, parentPath } = props;
            if (!children.value.length)
                return;

            return (
                <div class={[
                    'letgo-tree-node-children',
                    !isExpanded.value && 'is-hidden',
                ]}
                >
                    {children.value.map(item => (
                        <TreeNodeView
                            node={item}
                            zIndex={props.zIndex + 1}
                            parentPath={[...parentPath, node.value]}
                        />
                    ))}
                </div>
            );
        };

        const renderPrefix = () => {
            const { node } = props;
            if (!node.prefix)
                return null;

            return (
                <span class="letgo-tree-node-content-prefix">
                    {node.prefix?.()}
                </span>
            );
        };

        const renderSuffix = () => {
            const { node } = props;
            if (!node.suffix)
                return null;

            return (
                <span class="letgo-tree-node-content-suffix">
                    {node.suffix?.()}
                </span>
            );
        };

        return () => {
            const { node, zIndex } = props;
            if (isModalView.value && children.value.length <= 0)
                return '';

            if (node.vNode) {
                return (
                    <div class="letgo-tree-node" style={{ paddingLeft: `${zIndex * 16}px` }}>
                        <div class={['letgo-tree-drag-node', !dropInfo.value?.isAllow && 'is-danger']}></div>
                    </div>
                );
            }

            return (
                <div
                    class={[
                        'letgo-tree-node',
                        (isDragNode.value || !isShow.value) && 'is-hidden',
                        isDropNode.value && 'is-highlight',
                        isModalView.value && 'is-modal-view',
                    ]}
                >
                    <div
                        class={['letgo-tree-node-highlight', !dropInfo.value?.isAllow && 'is-danger']}
                        style={{ left: `${zIndex * 16 + 8}px` }}
                    >
                    </div>
                    <div
                        class={[
                            'letgo-tree-node-wrapper',
                            isSelected.value && 'is-selected',
                            node.checkable && 'is-checkable',
                        ]}
                        data-value={node.value}
                        style={{ paddingLeft: `${zIndex * 16}px` }}
                    >
                        {
                            ((node.isContainer || children.value.length > 0) && !isModalView.value)
                                ? (
                                    <span
                                        class={['letgo-tree-node-switcher']}
                                        onClick={handleClickSwitcher}
                                    >
                                        <CaretDownOutlined class={[
                                            'letgo-tree-node-switcher-icon',
                                            isExpanded.value && 'is-expanded',
                                        ]}
                                        />
                                    </span>
                                    )
                                : (
                                    <span class={['letgo-tree-node-switcher__tag']}></span>
                                    )
                        }
                        <span
                            class={['letgo-tree-node-content']}
                            onClick={() => handleSelect(node)}
                        >
                            {renderPrefix()}
                            <FEllipsis
                                class="letgo-tree-node-content-label"
                                content={node.label}
                            />
                            {renderSuffix()}
                        </span>
                    </div>
                    {renderChildren()}
                </div>
            );
        };
    },
});
