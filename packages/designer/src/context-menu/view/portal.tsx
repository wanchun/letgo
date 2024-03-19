import { Teleport, computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        appendTo: {
            type: [String, Object],
            default: 'body',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { slots }) {
        const inline = computed(() => {
            return props.disabled || props.appendTo === 'self';
        });
        return () => {
            if (inline.value)
                return slots.default?.();

            return <Teleport to={props.appendTo}>{slots.default?.()}</Teleport>;
        };
    },
});
