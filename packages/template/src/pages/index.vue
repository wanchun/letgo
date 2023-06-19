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
                    'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_25753_22.ce2d9ec2f0a0485d535c374cb4d448a5.js',
                    `${process.env.FES_APP_SIMULATOR_PATH}/index.umd.js`,
                    `${process.env.FES_APP_SIMULATOR_PATH}/style.css`,
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
