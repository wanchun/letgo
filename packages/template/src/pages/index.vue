<script lang="ts">
import { defineComponent } from 'vue';
import { LetgoEngine, project } from '@harrywan/letgo-engine';

export default defineComponent({
    components: { LetgoEngine },
    setup() {
        const onReady = () => {
            project.openDocument();
            setTimeout(() => {
                project.openDocument({
                    componentName: 'Page',
                    id: 'root',
                    ref: 'root',
                    props: {},
                    code: {
                        code: [],
                        directories: [],
                    },
                    title: '首页',
                    fileName: '/home',
                    isLocked: false,
                    condition: true,
                    children: [
                        {
                            componentName: 'FButton',
                            id: 'fButton1',
                            ref: 'fButton1',
                            props: {
                                children: '按钮',
                            },
                            title: '',
                            isLocked: false,
                            condition: true,
                        },
                    ],
                });
            }, 5000);
        };

        return {
            options: {
                vueRuntimeUrl:
                    'https://unpkg.com/vue/dist/vue.runtime.global.js',
                simulatorUrl: [
                    'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_25753_22.ce2d9ec2f0a0485d535c374cb4d448a5.js',
                    `${process.env.FES_APP_SIMULATOR_PATH}/index.umd.js`,
                    `${process.env.FES_APP_SIMULATOR_PATH}/style.css`,
                ],
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
