import type { LogLevel } from '@webank/letgo-common';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        count: Number,
        activeTags: Array as PropType<LogLevel[]>,
        name: String as PropType<LogLevel>,
        onSelect: Function as PropType<(name: LogLevel) => void>,
    },
    setup(props, { slots }) {
        const selectTag = () => {
            props.onSelect(props.name);
        };

        const isActive = computed(() => {
            return props.activeTags.includes(props.name);
        });

        return () => {
            return (
                <div onClick={selectTag} class={['letgo-plg-console__tag', isActive.value && 'letgo-plg-console__tag--active']}>
                    {slots.default?.()}
                    <span style="margin-left: 3px;">{props.count}</span>
                </div>
            );
        };
    },
});
