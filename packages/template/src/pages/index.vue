<script lang="ts">
import { defineComponent } from 'vue';
import { LetgoEngine, project } from '@harrywan/letgo-engine';
import { createRequest } from '@qlin/request';

export default defineComponent({
    components: { LetgoEngine },
    setup() {
        const onReady = () => {
            project.openDocument();
            console.log('project:', project);
        };

        return {
            options: {
                vueRuntimeUrl:
                    'https://registry.npmmirror.com/vue/latest/files/dist/vue.global.js',
                simulatorUrl: [
                    'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_25753_22.ce2d9ec2f0a0485d535c374cb4d448a5.js',
                    `${process.env.FES_APP_SIMULATOR_PATH}/index.umd.js`,
                    `${process.env.FES_APP_SIMULATOR_PATH}/style.css`,
                ],
                letgoRequest: createRequest({
                    mode: 'cors',
                    credentials: 'same-origin',
                    requestInterceptor(config) {
                        return config;
                    },
                }),
            },
            onReady,
        };
    },
});
</script>

<template>
  <LetgoEngine class="engine" :options="options" :on-ready="onReady" />
</template>

<style>
.engine {
    width: 100%;
    height: 100%;
}
</style>
