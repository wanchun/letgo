<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'Portal',
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
    setup(props) {
        const inline = computed(() => {
            return props.disabled || props.appendTo === 'self';
        });
        return {
            inline,
        };
    },
});
</script>

<template>
    <template v-if="inline">
        <slot />
    </template>
    <Teleport v-else :to="appendTo">
        <slot />
    </Teleport>
</template>
