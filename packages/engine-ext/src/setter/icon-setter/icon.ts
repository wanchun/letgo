import type { Component, PropType } from 'vue';
import { defineComponent, h } from 'vue';

export default defineComponent({
    props: {
        icons: Object as PropType<Record<string, Component>>,
        type: String,
        size: Number,
        color: String,
    },
    render() {
        if (!this.$props.icons[this.$props.type])
            return null;

        return h(this.$props.icons[this.$props.type], {
            style: {
                fontSize: `${this.$props.size}px`,
                color: this.$props.color,
                cursor: 'pointer',
                lineHeight: 0,
                display: 'inline-block',
                textAlign: 'center',
            },
        });
    },
});
