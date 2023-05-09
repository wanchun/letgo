<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { destroy, init, project } from '@webank/letgo-engine';

export default defineComponent({
    setup() {
        const containerRef = ref(null);

        onMounted(async () => {
            await init(containerRef.value, {
                vueRuntimeUrl:
                    'https://unpkg.com/vue/dist/vue.runtime.global.js',
                simulatorUrl: [
                    'http://127.0.0.1:8082/index.umd.js',
                    'http://127.0.0.1:8082/style.css',
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

<template>
  <div ref="containerRef" class="engine" />
</template>

<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
