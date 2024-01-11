import type {
    CSSProperties,
    PropType,
    Ref,
} from 'vue';
import {
    computed,
    defineComponent,
    onUnmounted,
    ref,
} from 'vue';
import { CloseOutlined, PasswordOutlined } from '@fesjs/fes-design/icon';
import { addUnit } from '@webank/letgo-common';
import type { Area } from '../area';
import type { IPanelConfig } from '../types';
import type { Panel } from '../widget';

export default defineComponent({
    name: 'LeftFloatArea',
    props: {
        area: {
            type: Object as PropType<Area<IPanelConfig, Panel>>,
        },
    },
    setup(props) {
        const { area } = props;
        const isFixedRef = ref(true);
        const style: Ref<CSSProperties> = computed(() => {
            const { current, items } = area;
            if (!items.length || !current) {
                return {
                    display: 'none',
                };
            }
            const currentProps = current?.props || {};
            if (isFixedRef.value) {
                return {
                    width: addUnit(currentProps.width),
                    height: addUnit(currentProps.height),
                    maxHeight: addUnit(currentProps.maxHeight),
                    maxWidth: addUnit(currentProps.maxWidth),
                };
            }
            return {
                position: 'relative',
                left: 0,
                width: addUnit(currentProps.width),
                height: addUnit(currentProps.height),
                maxHeight: addUnit(currentProps.maxHeight),
                maxWidth: addUnit(currentProps.maxWidth),
                boxShadow: 'none',
            };
        });
        const toggleFixed = () => {
            isFixedRef.value = !isFixedRef.value;
        };
        const handleClose = () => {
            area.unActiveAll();
        };

        const designer = area.skeleton.designer;

        const clear = designer.dragon.onDragstart(() => {
            if (isFixedRef.value)
                handleClose();
        });

        onUnmounted(() => {
            if (clear)
                clear();
        });

        return () => {
            const { area } = props;
            const { current, items } = area;
            const currentProps = current?.props || {};
            return (
                <div class="letgo-skeleton-workbench__left-float" style={style.value}>
                    <div class="letgo-skeleton-workbench__left-float-header">
                        {currentProps.title}
                        <div class="letgo-skeleton-workbench__left-float-icons">
                            <PasswordOutlined
                                class="letgo-skeleton-workbench__left-float-icon"
                                onClick={toggleFixed}
                            />
                            <CloseOutlined
                                class="letgo-skeleton-workbench__left-float-icon"
                                onClick={handleClose}
                            />
                        </div>
                    </div>
                    <div class="letgo-skeleton-workbench__left-float-body">
                        {items.map(item => item.content)}
                    </div>
                </div>
            );
        };
    },
});
