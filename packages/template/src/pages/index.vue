<template>
    <div ref="containerRef" class="engine"></div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { init } from '@webank/letgo-engine';
export default defineComponent({
    setup() {
        const containerRef = ref(null);

        onMounted(() => {
            init(containerRef.value, {});
        });

        return {
            containerRef,
        };
    },
});
</script>
<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
