<script lang="ts">
import { defineComponent } from 'vue';
import { IconSetter, LetgoEngine, material, project } from '@webank/letgo-engine';
import { createRequest } from '@qlin/request';
import lowcAssets from '../assets/lowcAssets';
import assets from '../assets/assets';
import icons from '../assets/icones-bags';
import page from '../assets/page';

export default defineComponent({
    components: { LetgoEngine },
    setup() {
        material.setAssets(lowcAssets);

        IconSetter.defaultIcons = icons;

        const onReady = () => {
            // project.openDocument({
            //     id: 'hello',
            //     componentName: 'Component',
            //     ref: 'root',
            //     fileName: 'hello',
            //     props: {},
            //     code: {
            //         directories: [],
            //         code: [],
            //     },
            // });
            project.openDocument({
                componentName: 'Page',
                id: 'hello',
                ref: 'root',
                props: {},
                fileName: 'compText',
                code: {
                    directories: [],
                    code: [],
                },
                isLocked: false,
                condition: true,
                title: '',
                children: [],
            });
            console.log('project:', project);
        };

        return {
            options: {
                enableContextMenu: true,
                vueRuntimeUrl:
                    'https://registry.npmmirror.com/vue/latest/files/dist/vue.global.js',
                simulatorUrl: [
                    `${process.env.FES_APP_SIMULATOR_PATH}/letgo-render.umd.js`,
                    `${process.env.FES_APP_SIMULATOR_PATH}/letgo-render.css`,
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
