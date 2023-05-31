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
import type { Area } from '../area';
import type { IPanelConfig } from '../types';
import type { Panel } from '../widget';
import {
    headerIconCls,
    headerIconsCls,
    leftFloatAreaBodyCls,
    leftFloatAreaCls,
    leftFloatAreaHeaderCls,
} from './workbench.css';

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
                    width: `${currentProps.width}px`,
                    height: `${currentProps.height}px`,
                    maxHeight: `${currentProps.maxHeight}px`,
                    maxWidth: `${currentProps.maxWidth}px`,
                };
            }
            return {
                position: 'relative',
                left: 0,
                width: `${currentProps.width}px`,
                height: `${currentProps.height}px`,
                maxHeight: `${currentProps.maxHeight}px`,
                maxWidth: `${currentProps.maxWidth}px`,
                marginLeft: '1px',
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
                <div class={leftFloatAreaCls} style={style.value}>
                    <div class={leftFloatAreaHeaderCls}>
                        {currentProps.title}
                        <div class={headerIconsCls}>
                            <PasswordOutlined
                                class={headerIconCls}
                                onClick={toggleFixed}
                            />
                            <CloseOutlined
                                class={headerIconCls}
                                onClick={handleClose}
                            />
                        </div>
                    </div>
                    <div class={leftFloatAreaBodyCls}>
                        {items.map(item => item.content)}
                    </div>
                </div>
            );
        };
    },
});
