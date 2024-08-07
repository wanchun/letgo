import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { Close, ExpandLeft, ExpandRight } from '@icon-park/vue-next';

export default defineComponent({
    props: {
        toggleFullscreen: Function as PropType<(isFullscreen: boolean) => void>,
        onClose: Function as PropType<() => void>,
    },
    setup(props) {
        const isFullScreen = ref(false);
        const innerToggleFullScreen = () => {
            isFullScreen.value = !isFullScreen.value;
            props.toggleFullscreen(isFullScreen.value);
        };
        const renderFullScreen = () => {
            if (isFullScreen.value) {
                return (
                    <ExpandRight
                        class="letgo-plg-code__screen-icon"
                        size={18}
                        theme="outline"
                        onClick={innerToggleFullScreen}
                    >
                    </ExpandRight>
                );
            }

            return (
                <ExpandLeft
                    class="letgo-plg-code__screen-icon"
                    size={18}
                    theme="outline"
                    onClick={innerToggleFullScreen}
                >
                </ExpandLeft>
            );
        };

        return () => {
            return (
                <div class="letgo-plg-code__header">
                    {renderFullScreen()}
                    <Close onClick={props.onClose} size={16} class="letgo-plg-code__header-close" />
                </div>
            );
        };
    },
});
