import { defineComponent, computed, PropType } from 'vue';
import { Simulator } from '../simulator';

export const BorderDetectingView = defineComponent({
    name: 'BorderDetectingView',
    props: {
        host: {
            type: Object as PropType<Simulator>,
        },
    },
    setup(props) {
        const { host } = props;
        const { scrollX, scrollY, scale } = host.viewport;

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

            return null;
        };
    },
});
