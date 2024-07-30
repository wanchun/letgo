import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        count: Number,
        isActive: Boolean,
    },
    setup(props, { slots }) {
        return () => {
            return (
                <div class={['letgo-plg-console__tag', props.isActive && 'letgo-plg-console__tag--active']}>
                    {slots.default?.()}
                    <span style="margin-left: 3px;">{props.count}</span>
                </div>
            );
        };
    },
});
