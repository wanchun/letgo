import type {
    CSSProperties,
    PropType,
    VNodeChild,
} from 'vue';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
} from 'vue';
import { FTooltip } from '@fesjs/fes-design';
import type { IPublicTypeComponentActionContent } from '@harrywan/letgo-types';
import {
    isActionContentObject,
} from '@harrywan/letgo-types';
import { createIcon } from '@harrywan/letgo-common';
import type { Simulator } from '../simulator';
import NodeSelectorView from '../node-selector';
import type { INode } from '../../types';
import type { OffsetObserver } from '../../designer';
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

            const { offsetWidth, offsetHeight, offsetTop, offsetLeft }
                = observed;

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
                        <Toolbar observed={observed} simulator={props.simulator} />
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
