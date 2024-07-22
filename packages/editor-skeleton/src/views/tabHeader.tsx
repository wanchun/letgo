import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { ITabPanel } from '../types';
import './tabHeader.less';

export default defineComponent({
    name: 'TabHeader',
    props: {
        widget: {
            type: Object as PropType<ITabPanel>,
        },
        onClick: {
            type: Function,
        },
    },
    setup(props) {
        const { widget } = props;

        const isActive = computed(() => {
            return props.widget?.visible;
        });

        return () => {
            if (widget.disabled) {
                return (
                    <div class="letgo-skeleton__tabHeader letgo-skeleton__tabHeader--disabled">{widget.header}</div>
                );
            }
            if (props.onClick) {
                return (
                    <div class={['letgo-skeleton__tabHeader', isActive.value && 'letgo-skeleton__tabHeader--active']} onClick={() => props.onClick()}>
                        {widget.header}
                    </div>
                );
            }
            return <div class="letgo-skeleton__tabHeader">{widget.header}</div>;
        };
    },
});
