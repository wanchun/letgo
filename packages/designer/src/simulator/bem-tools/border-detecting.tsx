import { defineComponent, computed, PropType } from 'vue';
import { InnerComponentInstance } from '../../types';
import { Simulator } from '../simulator';
import {
    borderCls,
    borderDetectingCls,
    borderTitleCls,
    borderStatusCls,
} from './borders.css';

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
                width: props.rect?.width * props.scale + 'px',
                height: props.rect?.height * props.scale + 'px',
                transform: `translate(${
                    (scrollX + props.rect?.left) * props.scale
                }px, ${(scrollY + props.rect?.top) * props.scale}px)`,
            };
        });

        return () => {
            if (!props.rect) {
                return null;
            }
            return (
                <div
                    class={[borderCls, borderDetectingCls]}
                    style={style.value}
                >
                    <span title={props.title} class={borderTitleCls}>
                        {props.title}
                    </span>
                    {props.isLocked ? (
                        <span title="已锁定" class={borderStatusCls}>
                            已锁定
                        </span>
                    ) : null}
                </div>
            );
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
            const doc = host.project.currentDocument.value;
            if (!doc) {
                return null;
            }
            const { selection } = doc;
            const { current } = host.designer.detecting;

            if (
                !current.value ||
                current.value.document !== doc ||
                selection.has(current.value.id)
            ) {
                return null;
            }
            return current.value;
        });

        return () => {
            const currentNode = currentNodeRef.value;
            if (!currentNode) return;

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

            const getReact = (inst: InnerComponentInstance) => {
                return host.computeComponentInstanceRect(
                    inst,
                    currentNode.componentMeta.rootSelector,
                );
            };

            return (
                <>
                    {instances.map((inst) => (
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
