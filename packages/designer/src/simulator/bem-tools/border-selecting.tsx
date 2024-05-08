import { FButton, FGrid, FGridItem, FInput, FTooltip } from '@fesjs/fes-design';
import { AddOne } from '@icon-park/vue-next';
import { createIcon, isComponentDescription } from '@webank/letgo-common';
import { useLastUsed } from '@webank/letgo-components';
import type { IPublicTypeAssetsJson, IPublicTypeComponentActionContent, IPublicTypeComponentDescription, IPublicTypeSnippet } from '@webank/letgo-types';
import {
    isActionContentObject,
} from '@webank/letgo-types';
import type {
    CSSProperties,
    PropType,
    Ref,
    VNodeChild,
} from 'vue';
import {
    computed,
    defineComponent,
    onBeforeMount,
    onBeforeUnmount,
    onUnmounted,
    ref,
    shallowRef,
} from 'vue';
import type { OffsetObserver } from '../../designer';
import { insertChild } from '../../node';
import type { INode } from '../../types';
import NodeSelectorView from '../node-selector';
import type { Simulator } from '../simulator';
import './borders.less';

export function createAction(content: IPublicTypeComponentActionContent, key: string, node: INode, simulator: Simulator) {
    if (typeof content === 'string')
        return content;

    if (typeof content === 'function')
        return content({ key, node });

    if (isActionContentObject(content)) {
        const { action, title, icon } = content;
        const handleClick = () => {
            if (action)
                action(node);

            const editor = simulator.designer.editor;
            const npm = node?.componentMeta?.npm;
            const selected
                = [npm?.package, npm?.exportName]
                    .filter(item => !!item)
                    .join('-')
                    || node?.componentMeta?.componentName
                    || '';

            editor?.emit('designer.border.action', {
                name: key,
                selected,
            });
        };
        return (
            <div key={key} class="letgo-designer-sim__border-action" onClick={handleClick}>
                <FTooltip content={title} placement="top">
                    {icon && createIcon(icon)}
                </FTooltip>
            </div>
        );
    }
    return null;
}

export const Toolbar = defineComponent({
    name: 'Toolbar',
    props: {
        observed: {
            type: Object as PropType<OffsetObserver>,
        },
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        return () => {
            const { observed } = props;
            const { height, width } = observed.viewport;
            const BAR_HEIGHT = 20;
            const MARGIN = 1;
            const BORDER = 2;
            const SPACE_HEIGHT = BAR_HEIGHT + MARGIN + BORDER;
            const SPACE_MINIMUM_WIDTH = 160; // magic number，大致是 toolbar 的宽度
            let style: CSSProperties;
            // 计算 toolbar 的上/下位置
            if (observed.top > SPACE_HEIGHT) {
                style = {
                    top: `${-SPACE_HEIGHT}px`,
                    height: `${BAR_HEIGHT}px`,
                };
            }
            else if (observed.bottom + SPACE_HEIGHT < height) {
                style = {
                    bottom: `${-SPACE_HEIGHT}px`,
                    height: `${BAR_HEIGHT}px`,
                };
            }
            else {
                style = {
                    height: `${BAR_HEIGHT}px`,
                    top: `${Math.max(MARGIN, MARGIN - observed.top)}px`,
                };
            }
            // 计算 toolbar 的左/右位置
            if (
                SPACE_MINIMUM_WIDTH
                > observed.left + observed.width
            ) {
                style.left = `${Math.max(
                    -BORDER,
                    observed.left - width - BORDER,
                )}px`;
            }
            else {
                style.right = `${Math.max(
                    -BORDER,
                    observed.right - width - BORDER,
                )}px`;
                style.justifyContent = 'flex-start';
            }
            const { node } = observed;
            const actions: VNodeChild = [];
            node.componentMeta.availableActions.forEach((action) => {
                const { important = true, condition, content, name } = action;
                if (
                    important
                    && (typeof condition === 'function'
                        ? condition(node) !== false
                        : condition !== false)
                )
                    actions.push(createAction(content, name, node, props.simulator));
            });
            return (
                <div class="letgo-designer-sim__border-actions" style={style}>
                    {actions}
                    <NodeSelectorView node={node} />
                </div>
            );
        };
    },
});

export const AddNextComponent = defineComponent({
    name: 'AddNextComponent',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
        node: {
            type: Object as PropType<INode>,
        },
        isInline: Boolean,
    },
    setup(props) {
        const editor = props.simulator.designer.editor;
        const assetsRef: Ref<IPublicTypeAssetsJson> = shallowRef({});
        const isInsertNext = ref(false);
        const searchText: Ref<string> = ref();

        const snippetsRef = computed(() => {
            let arr: Array<IPublicTypeSnippet & { component: IPublicTypeComponentDescription; priority: number; title: string; screenshot?: string; group?: string; category: string }> = [];
            assetsRef.value.components.forEach((component: IPublicTypeComponentDescription) => {
                if (!isComponentDescription(component))
                    return;
                arr = arr.concat((component.snippets ?? []).map((snippet: IPublicTypeSnippet) => {
                    return {
                        component,
                        title: component.title,
                        screenshot: component.screenshot,
                        group: component.group,
                        category: component.category,
                        priority: component.priority ?? 0,
                        ...snippet,
                    };
                }));
            });
            return arr.sort((a, b) => {
                return a.priority - b.priority;
            }).filter((snippet) => {
                if (!searchText.value)
                    return true;
                const regex = RegExp(searchText.value, 'i');
                return regex.test(snippet.title + snippet.component.componentName + snippet.keywords);
            });
        });
        const { addLastUsed, lastUsedSnippets } = useLastUsed(snippetsRef);

        // 下一个推荐的组件
        const nextSnippets = computed(() => {
            const limitNum = 10; // 最多推荐数量
            // 获取相同分组组件
            const { group, category } = snippetsRef.value.find((item => item.component.componentName === props.node?.componentName)) || {};
            const snippets = snippetsRef.value.filter(item => item.group === group && item.category === category);
            if (snippets.length >= limitNum)
                return snippets;

            // 用最近常用的组件补充
            let index = 0;
            while (limitNum - snippets.length > 0 && index < lastUsedSnippets.value.length) {
                const snippet = lastUsedSnippets.value[index];
                if (snippet.group !== group || snippet.category !== category)
                    snippets.push(snippet);

                index++;
            }
            return snippets;
        });

        const addNode = (snippet: IPublicTypeSnippet) => {
            const parent = props.node?.parent;
            if (!parent)
                return;
            addLastUsed(snippet);
            const index = isInsertNext.value ? props.node.index + 1 : props.node.index;
            const newNode = insertChild(parent, snippet.schema, index);
            newNode.document.selection.select(newNode.id);
            const editor = newNode.document.project.designer.editor;
            const npm = newNode?.componentMeta?.npm;
            const selected
                = [npm?.package, npm?.exportName]
                    .filter(item => !!item)
                    .join('-')
                    || newNode?.componentMeta?.componentName
                    || '';
            editor?.emit('designer.border.action', {
                name: 'select',
                selected,
            });
        };

        let unwatch: () => void;
        onBeforeMount(() => {
            unwatch = editor.onChange('assets', (assets: IPublicTypeAssetsJson) => {
                assetsRef.value = assets;
            });
        });

        onUnmounted(() => {
            if (unwatch)
                unwatch();
        });

        const renderSnippet = (snippets: IPublicTypeSnippet[]) => {
            return snippets.map((snippet) => {
                const renderIcon = () => {
                    return (
                        snippet.screenshot && (
                            <img
                                class="letgo-components__icon"
                                src={snippet.screenshot}
                                draggable="false"
                            />
                        )
                    );
                };
                return (
                    <FGridItem span={12}>
                        <FButton class="letgo-components__item" v-slots={{ icon: renderIcon }} onClick={() => addNode(snippet)}>
                            {snippet.title}
                        </FButton>
                    </FGridItem>
                );
            });
        };

        const contentSlot = () => {
            return (
                <div class="letgo-designer-sim__border-add-next-components">
                    <FInput v-model={searchText.value} placeholder="搜索组件" style="margin-bottom: 12px"></FInput>
                    <FGrid wrap gutter={[10, 10]}>
                        {renderSnippet(nextSnippets.value)}
                    </FGrid>
                </div>
            );
        };

        return () => {
            return (
                <>
                    <span class={['letgo-designer-sim__border-add-next', props.isInline ? 'left' : 'top']} title="向前添加一个组件">
                        <FTooltip mode="popover" v-slots={{ content: contentSlot }} trigger="click">
                            <AddOne theme="filled" size="16" fill="#5384ff" onClick={() => isInsertNext.value = false}></AddOne>
                        </FTooltip>
                    </span>
                    <span class={['letgo-designer-sim__border-add-next', props.isInline ? 'right' : 'bottom']} title="向后添加一个组件">
                        <FTooltip mode="popover" v-slots={{ content: contentSlot }} trigger="click">
                            <AddOne theme="filled" size="16" fill="#5384ff" onClick={() => isInsertNext.value = true}></AddOne>
                        </FTooltip>
                    </span>
                </>

            );
        };
    },
});

export const BorderSelectingInstance = defineComponent({
    name: 'BorderSelectingInstance',
    props: {
        dragging: {
            type: Boolean as PropType<boolean>,
        },
        observed: {
            type: Object as PropType<OffsetObserver>,
        },
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        onBeforeUnmount(() => {
            props.observed?.purge();
        });

        return () => {
            const { observed, dragging } = props;
            if (!observed.hasOffset)
                return null;

            const { offsetWidth, offsetHeight, offsetTop, offsetLeft, node }
                = observed;
            const isInline = offsetWidth < props.simulator.viewport.width;

            const style: CSSProperties = {
                width: `${offsetWidth}px`,
                height: `${offsetHeight}px`,
                transform: `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`,
            };

            return (
                <div
                    class={[
                        'letgo-designer-sim__border',
                        'letgo-designer-sim__border--selecting',
                        dragging && 'letgo-designer-sim__border--dragging',
                    ]}
                    style={style}
                >
                    {!dragging && (
                        <>
                            { !node.isRoot() && <AddNextComponent simulator={props.simulator} node={node} isInline={isInline} />}
                            <Toolbar observed={observed} simulator={props.simulator} />
                        </>
                    )}
                </div>
            );
        };
    },
});

export const BorderSelectingForNode = defineComponent({
    name: 'BorderSelectingForNode',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
        node: {
            type: Object as PropType<INode>,
        },
    },
    setup(props) {
        const { simulator, node } = props;
        const { designer } = simulator;

        return () => {
            const instances = simulator.getComponentInstances(node);
            if (!instances || instances.length < 1)
                return;

            const dragging = designer.dragon.dragging;
            return (
                <>
                    {instances.map((instance) => {
                        const observed = designer.createOffsetObserver({
                            node,
                            instance,
                        });
                        if (!observed)
                            return null;

                        return (
                            <BorderSelectingInstance
                                key={observed.id}
                                dragging={dragging}
                                observed={observed}
                                simulator={simulator}
                            />
                        );
                    })}
                </>
            );
        };
    },
});

export const BorderSelectingView = defineComponent({
    name: 'BorderSelectingView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { simulator } = props;

        const selecting = computed(() => {
            const dragging = simulator.designer.dragon.dragging;
            const doc = simulator.project.currentDocument;
            if (!doc)
                return null;

            const { selection } = doc;
            return dragging ? selection.getTopNodes() : selection.getNodes();
        });

        return () => {
            if (!selecting.value || selecting.value.length < 1)
                return null;

            return (
                <>
                    {selecting.value.map(node => (
                        <BorderSelectingForNode
                            key={node.id}
                            simulator={simulator}
                            node={node}
                        />
                    ))}
                </>
            );
        };
    },
});
