<template>
    <div ref="containerRef" class="engine"></div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { init, destroy, project } from '@webank/letgo-engine';

export default defineComponent({
    setup() {
        const containerRef = ref(null);

        onMounted(async () => {
            await init(containerRef.value, {
                simulatorUrl: [
                    `http://127.0.0.1:8082/index.umd.js`,
                    `http://127.0.0.1:8082/style.css`,
                ],
            });
            project.openDocument();
        });

        onBeforeUnmount(() => {
            destroy();
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
