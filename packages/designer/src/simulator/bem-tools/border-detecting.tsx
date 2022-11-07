import { defineComponent, computed, PropType } from 'vue';
import { Simulator } from '../simulator';

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
                width: props.rect?.width * props.scale,
                height: props.rect?.height * props.scale,
                transform: `translate(${
                    (scrollX + props.rect?.left) * props.scale
                }px, ${(scrollY + props.rect?.top) * props.scale}px)`,
            };
        });

        return () => {
            if (!props.rect) {
                return null;
            }
            <div
                class={['letgo-borders', 'letgo-borders-detecting']}
                style={style.value}
            >
                <span title={props.title} class="letgo-borders-title">
                    {props.title}
                </span>
                {props.isLocked ? (
                    <span title="已锁定" class="letgo-borders-status">
                        已锁定
                    </span>
                ) : null}
            </div>;
        };
    },
});

export const BorderDetectingView = defineComponent({
    name: 'BorderDetectingView',
    props: {
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { host } = props;

        const currentNodeRef = computed(() => {
            const doc = host.currentDocument;
            if (!doc) {
                return null;
            }
            const { selection } = doc;
            const { current } = host.designer.detecting;

            if (
                !current ||
                current.document !== doc ||
                selection.has(current.id)
            ) {
                return null;
            }
            return current;
        });

        return () => {
            const currentNode = currentNodeRef.value;

            const canHoverHook =
                currentNode?.componentMeta.getMetadata()?.configure.advanced
                    ?.callbacks?.onHoverHook;
            const canHover =
                canHoverHook && typeof canHoverHook === 'function'
                    ? canHoverHook(currentNode)
                    : true;

            if (!canHover || !currentNode || host.viewport.scrolling) {
                return null;
            }

            // rootNode, hover whole viewport
            const focusNode = currentNode.document.focusNode;
            if (!focusNode.contains(currentNode)) {
                return null;
            }

            const { scrollX, scrollY, scale, bounds } = host.viewport;

            if (currentNode.contains(focusNode)) {
                return (
                    <BorderDetectingInstance
                        key="line-root"
                        title={currentNode.title}
                        scale={scale}
                        scrollX={scrollX}
                        scrollY={scrollY}
                        rect={new DOMRect(0, 0, bounds.width, bounds.height)}
                    />
                );
            }

            const instances = host.getComponentInstances(currentNode);
            if (!instances || instances.length < 1) {
                return null;
            }

            return (
                <>
                    {instances.map((inst, i) => (
                        <BorderDetectingInstance
                            key={`line-h-${i}`}
                            title={currentNode.title}
                            scale={scale}
                            scrollX={scrollX}
                            scrollY={scrollY}
                            rect={host.computeComponentInstanceRect(
                                inst,
                                currentNode.componentMeta.rootSelector,
                            )}
                        />
                    ))}
                </>
            );
        };
    },
});
