import { defineComponent, PropType, shallowRef, onBeforeUnmount } from 'vue';
import { Designer } from './designer';
import { isDragNodeObject, isDragNodeDataObject } from './dragon';
import './drag-host.less';

export const DragHostView = defineComponent({
    name: 'DragHostView',
    props: {
        designer: {
            type: Object as PropType<Designer>,
        },
    },
    setup(props) {
        const dragObject = shallowRef();

        const x = shallowRef();

        const y = shallowRef();

        const dragon = props.designer.dragon;

        const dispose = [
            dragon.onDragstart((e) => {
                if (e.originalEvent.type.slice(0, 4) === 'drag') {
                    return;
                }
                dragObject.value = e.dragObject;
                x.value = e.globalX;
                y.value = e.globalY;
            }),
            dragon.onDrag((e) => {
                x.value = e.globalX;
                y.value = e.globalY;
            }),
            dragon.onDragend(() => {
                dragObject.value = null;
                x.value = 0;
                y.value = 0;
            }),
        ];

        const renderGhostGroup = () => {
            const _dragObject = dragObject.value;
            if (isDragNodeObject(_dragObject)) {
                return _dragObject.nodes.map((node) => {
                    const ghost = (
                        <div class="letgo-ghost" key={node.id}>
                            {node.title}
                        </div>
                    );
                    return ghost;
                });
            } else if (isDragNodeDataObject(_dragObject)) {
                return Array.isArray(_dragObject.data) ? (
                    _dragObject.data.map((item, index) => {
                        return (
                            <div class="letgo-ghost" key={`ghost-${index}`}>
                                <div class="letgo-ghost-title">
                                    {item.componentName}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div class="letgo-ghost">
                        <div class="letgo-ghost-title">
                            {_dragObject.data.componentName}
                        </div>
                    </div>
                );
            }
        };

        onBeforeUnmount(() => {
            dispose.forEach((off) => off());
        });

        return () => {
            if (!dragObject.value) {
                return null;
            }
            return (
                <div
                    class="letgo-ghost-group"
                    style={{
                        left: x.value + 'px',
                        top: y.value + 'px',
                    }}
                >
                    {renderGhostGroup()}
                </div>
            );
        };
    },
});
