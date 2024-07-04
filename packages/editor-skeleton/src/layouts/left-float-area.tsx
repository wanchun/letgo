import type {
    CSSProperties,
    PropType,
    Ref,
} from 'vue';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    ref,
    watch,
} from 'vue';
import { Close, Lock, Unlock } from '@icon-park/vue-next';
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
        const style: Ref<CSSProperties> = computed(() => {
            const { current, items } = area;
            if (!items.length || !current) {
                return {
                    display: 'none',
                };
            }
            const currentProps = current?.props || {};
            if (current.isFixed) {
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
            area.current?.toggleFixed();
        };
        const handleClose = () => {
            area.unActiveAll();
        };

        const designer = area.skeleton.designer;

        const isSimulatorReady: Ref<boolean> = ref(designer.isRendererReady);

        const disposeFunctions: Array<() => void> = [
            // 开始拖拽，则关闭 fixed
            designer.dragon.onDragstart(() => {
                if (area.current?.isFixed)
                    handleClose();
            }),
            designer.onRendererReady(() => {
                isSimulatorReady.value = true;
            }),
        ];

        watch(isSimulatorReady, () => {
            if (isSimulatorReady.value) {
                disposeFunctions.push(
                    // 点击画布，则关闭 fixed
                    designer.simulator.onEvent('contentDocument.mousedown', () => {
                        if (area.current?.isFixed)
                            handleClose();
                    }),
                );
            }
        });

        onBeforeUnmount(() => {
            disposeFunctions.forEach(clear => clear());
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
                            {
                                current?.isFixed && (
                                    <Unlock
                                        class="letgo-skeleton-workbench__left-float-icon"
                                        onClick={toggleFixed}
                                    />
                                )
                            }
                            {
                                !current?.isFixed && (
                                    <Lock
                                        class="letgo-skeleton-workbench__left-float-icon"
                                        onClick={toggleFixed}
                                    />
                                )
                            }
                            <Close
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
