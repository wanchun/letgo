import {
    defineComponent,
    PropType,
    ref,
    Ref,
    CSSProperties,
    onUnmounted,
} from 'vue';
import { Designer } from '@webank/letgo-designer';
import { CloseOutlined, PasswordOutlined } from '@fesjs/fes-design/icon';
import { computed } from 'vue';
import { Area } from '../area';
import { IPanelConfig } from '../types';
import { Panel } from '../widget';

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
            if (!items.value.length || !current.value) {
                return {
                    display: 'none',
                };
            }
            const currentProps = current.value?.props || {};
            if (isFixedRef.value) {
                return {
                    width: currentProps.width,
                    height: currentProps.height,
                    maxHeight: currentProps.maxHeight,
                    maxWidth: currentProps.maxWidth,
                };
            }
            return {
                position: 'relative',
                left: 0,
                width: currentProps.width,
                height: currentProps.height,
                maxHeight: currentProps.maxHeight,
                maxWidth: currentProps.maxWidth,
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

        const designer: Designer = area.skeleton.editor.get('designer');

        const clear = designer.dragon.onDragstart(() => {
            if (isFixedRef.value) {
                handleClose();
            }
        });

        onUnmounted(() => {
            if (clear) {
                clear();
            }
        });

        return () => {
            const { area } = props;
            const { current, items } = area;
            const currentProps = current.value?.props || {};
            return (
                <div class="letgo-left-float-area" style={style.value}>
                    <div class="letgo-left-float-area-header">
                        {currentProps.title}
                        <div class="area-header-icons">
                            <PasswordOutlined
                                class="header-icon"
                                onClick={toggleFixed}
                            />
                            <CloseOutlined
                                class="header-icon"
                                onClick={handleClose}
                            />
                        </div>
                    </div>
                    <div class="letgo-left-float-area-body">
                        {items.value.map((item) => item.content)}
                    </div>
                </div>
            );
        };
    },
});
