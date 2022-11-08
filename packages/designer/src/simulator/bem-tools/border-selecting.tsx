import {
    defineComponent,
    PropType,
    computed,
    onBeforeUnmount,
    ShallowReactive,
    CSSProperties,
    VNodeChild,
} from 'vue';
import {
    ComponentActionType,
    isActionContentObject,
} from '@webank/letgo-types';
import { createIcon } from '@webank/letgo-utils';
import { Simulator } from '../simulator';
import NodeSelectorView from '../node-selector';
import { Node } from '../../node';
import { OffsetObserver } from '../../designer';

export const createAction = (
    content: ComponentActionType,
    key: string,
    node: Node,
    host: Simulator,
) => {
    if (typeof content === 'string') {
        return content;
    }
    if (typeof content === 'function') {
        return content({ key, node });
    }
    if (isActionContentObject(content)) {
        const { action, title, icon } = content;
        const handleClick = () => {
            if (action) {
                action(node);
            }
            const editor = host.designer.editor;
            const npm = node?.componentMeta?.npm;
            const selected =
                [npm?.package, npm?.componentName]
                    .filter((item) => !!item)
                    .join('-') ||
                node?.componentMeta?.componentName ||
                '';
            editor?.emit('designer.border.action', {
                name: key,
                selected,
            });
        };
        return (
            <div key={key} class="letgo-borders-action" onClick={handleClick}>
                {icon && createIcon(icon)}
                {title}
            </div>
        );
    }
    return null;
};

export const Toolbar = defineComponent({
    name: 'Toolbar',
    props: {
        observed: {
            type: Object as PropType<ShallowReactive<OffsetObserver>>,
        },
        host: {
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
                    top: -SPACE_HEIGHT,
                    height: BAR_HEIGHT,
                };
            } else if (observed.bottom + SPACE_HEIGHT < height) {
                style = {
                    bottom: -SPACE_HEIGHT,
                    height: BAR_HEIGHT,
                };
            } else {
                style = {
                    height: BAR_HEIGHT,
                    top: Math.max(MARGIN, MARGIN - observed.top),
                };
            }
            // 计算 toolbar 的左/右位置
            if (SPACE_MINIMUM_WIDTH > observed.left + observed.width) {
                style.left = Math.max(-BORDER, observed.left - width - BORDER);
            } else {
                style.right = Math.max(
                    -BORDER,
                    observed.right - width - BORDER,
                );
                style.justifyContent = 'flex-start';
            }
            const { node } = observed;
            const actions: VNodeChild = [];
            node.componentMeta.availableActions.forEach((action) => {
                const { important = true, condition, content, name } = action;
                if (
                    important &&
                    (typeof condition === 'function'
                        ? condition(node) !== false
                        : condition !== false)
                ) {
                    actions.push(createAction(content, name, node, props.host));
                }
            });
            return (
                <div class="letgo-borders-actions" style={style}>
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
            type: Object as PropType<ShallowReactive<OffsetObserver>>,
        },
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        onBeforeUnmount(() => {
            props.observed?.purge();
        });

        return () => {
            const { observed, dragging } = props;
            if (!observed.hasOffset) {
                return null;
            }

            const { offsetWidth, offsetHeight, offsetTop, offsetLeft } =
                observed;

            const style = {
                width: offsetWidth,
                height: offsetHeight,
                transform: `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`,
            };

            return (
                <div
                    class={[
                        'letgo-borders',
                        'letgo-borders-selecting',
                        dragging && 'is-dragging',
                    ]}
                    style={style}
                >
                    {!dragging && (
                        <Toolbar observed={observed} host={props.host} />
                    )}
                </div>
            );
        };
    },
});

export const BorderSelectingForNode = defineComponent({
    name: 'BorderSelectingForNode',
    props: {
        host: {
            type: Object as PropType<Simulator>,
        },
        node: {
            type: Object as PropType<Node>,
        },
    },
    setup(props) {
        const { host, node } = props;
        const { designer } = host;
        const instances = computed(() => {
            return host.getComponentInstances(node);
        });

        return () => {
            if (!instances.value || instances.value.length < 1) {
                return;
            }
            const dragging = designer.dragon.dragging;
            return (
                <>
                    {instances.value.map((instance) => {
                        const observed = designer.createOffsetObserver({
                            node,
                            instance,
                        });
                        if (!observed) {
                            return null;
                        }
                        return (
                            <BorderSelectingInstance
                                key={observed.id}
                                dragging={dragging}
                                observed={observed}
                                host={host}
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
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { host } = props;

        const selecting = computed(() => {
            const dragging = host.designer.dragon.dragging;
            const doc = host.currentDocument;
            if (!doc) {
                return null;
            }
            const { selection } = doc;
            return dragging ? selection.getTopNodes() : selection.getNodes();
        });

        return () => {
            if (!selecting.value || selecting.value.length < 1) {
                return null;
            }
            return (
                <>
                    {selecting.value.map((node) => (
                        <BorderSelectingForNode
                            key={node.id}
                            host={host}
                            node={node}
                        />
                    ))}
                </>
            );
        };
    },
});
