import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { IPublicTypeComponentRecord } from '@webank/letgo-types';
import type { Simulator } from '../simulator';
import './borders.less';

export const BorderDetectingInstance = defineComponent({
    name: 'BorderDetectingInstance',
    props: {
        title: String as PropType<string>,
        rect: DOMRect as PropType<DOMRect>,
        scale: Number as PropType<number>,
        scrollX: Number as PropType<number>,
        scrollY: Number as PropType<number>,
        isLocked: Boolean as PropType<boolean>,
    },
    setup(props) {
        const style = computed(() => {
            return {
                width: `${props.rect?.width * props.scale}px`,
                height: `${props.rect?.height * props.scale}px`,
                transform: `translate(${
                    (props.scrollX + props.rect?.left) * props.scale
                }px, ${(props.scrollY + props.rect?.top) * props.scale}px)`,
            };
        });

        return () => {
            if (!props.rect)
                return null;

            return (
                <div
                    class="letgo-designer-sim__border letgo-designer-sim__border--detecting"
                    style={style.value}
                >
                    <span title={props.title} class="letgo-designer-sim__border-title">
                        {props.title}
                    </span>
                    {props.isLocked
                        ? (
                            <span title="已锁定" class="letgo-designer-sim__border-status">
                                已锁定
                            </span>
                            )
                        : null}
                </div>
            );
        };
    },
});

export const BorderDetectingView = defineComponent({
    name: 'BorderDetectingView',
    props: {
        simulator: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { simulator } = props;

        const currentNodeRef = computed(() => {
            const doc = simulator.project.currentDocument;
            if (!doc)
                return null;

            const { selection } = doc;
            const { current } = simulator.designer.detecting;

            if (
                !current
                || current.document !== doc
                || selection.has(current.id)
            )
                return null;

            return current;
        });

        return () => {
            const currentNode = currentNodeRef.value;
            if (!currentNode)
                return;

            const canHoverHook
                = currentNode?.componentMeta.getMetadata()?.configure.advanced
                    ?.callbacks?.onHoverHook;
            const canHover
                = typeof canHoverHook === 'function'
                    ? canHoverHook(currentNode)
                    : true;

            if (!canHover || !currentNode || simulator.viewport.scrolling)
                return null;

            // rootNode, hover whole viewport
            const focusNode = currentNode.document.focusNode;
            if (!focusNode.contains(currentNode))
                return null;

            const { scrollX, scrollY, scale, bounds } = simulator.viewport;

            if (currentNode.contains(focusNode)) {
                return (
                    <BorderDetectingInstance
                        title={currentNode.title}
                        scale={scale}
                        scrollX={scrollX}
                        scrollY={scrollY}
                        rect={new DOMRect(0, 0, bounds.width, bounds.height)}
                    />
                );
            }

            const instances = simulator.getComponentInstances(currentNode);
            if (!instances || instances.length < 1)
                return null;

            const getReact = (inst: IPublicTypeComponentRecord) => {
                return simulator.computeComponentInstanceRect(
                    inst,
                    currentNode.componentMeta.rootSelector,
                );
            };

            return (
                <>
                    {instances.map(inst => (
                        <BorderDetectingInstance
                            title={currentNode.title}
                            scale={scale}
                            scrollX={scrollX}
                            scrollY={scrollY}
                            rect={getReact(inst)}
                        />
                    ))}
                </>
            );
        };
    },
});
