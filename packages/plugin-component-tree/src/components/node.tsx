import type { PropType } from 'vue';
import { computed, defineComponent, inject, nextTick, ref, watch } from 'vue';
import { isUndefined } from 'lodash-es';
import { CaretDownOutlined } from '@fesjs/fes-design/icon';
import { FEllipsis } from '@fesjs/fes-design';
import { TREE_PROVIDE_KEY } from './const';
import type { TreeNode } from './const';

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

        const isHovering = ref(false);

        const onMouseEnter = () => {
            if (props.node.checkable)
                isHovering.value = true;
        };

        const onMouseLeave = () => {
            if (props.node.checkable)
                isHovering.value = false;
        };

        return () => {
            const { node, zIndex } = props;

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
                            isHovering.value && 'is-hovering',
                            node.checkable && 'is-checkable',
                        ]}
                        data-value={node.value}
                        style={{ paddingLeft: `${zIndex * 16}px` }}
                        onMouseenter={onMouseEnter}
                        onMouseleave={onMouseLeave}
                    >
                        {
                            (node.isContainer || children.value.length > 0)
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
