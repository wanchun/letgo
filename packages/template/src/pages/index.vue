<script lang="ts">
import { defineComponent } from 'vue';
import { IconSetter, LetgoEngine, material, project } from '@webank/letgo-engine';
import { createRequest } from '@qlin/request';
import assets from '../assets/assets';
import icons from '../assets/icones-bags';
import page from '../assets/page';

project.importSchema({
    version: '1.0.0',
    componentsMap: [],
    componentsTree: [],
    code: {
        directories: [],
        code: [
            {
                id: 'lifecycleHook1',
                type: 'lifecycleHook',
                hookName: 'beforeRender',
                funcBody: '// Tip: 编写代码\nconsole.log("beforeRender");\nconsole.log(utils);',
            },
        ],
    },
    css: `
.mt-16 {
    margin-top: 16px;
}
.c-red {
    color: red;
}
.mt-16.c-red {
    font-size: 12px;
}
.mt-16.c-red, .xx {
    font-size: 12px;
}
.xx {
    color: blue;
}
    `,
});

export default defineComponent({
    components: { LetgoEngine },
    setup() {
        material.setAssets(assets);

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
                    code: [
                        {
                            id: 'lifecycleHook2',
                            type: 'lifecycleHook',
                            hookName: 'onMounted',
                            funcBody: '// Tip: 编写代码\nconsole.log("mounted")',
                        },
                    ],
                },
                classCode: `
                class Main extends Page {
                    constructor(ctx) {
                        super(ctx);
                        this.a = 1;
                    }

                    get hello() {
                        return this.a + 1;
                    }
                    setA(value) {
                        this.a = value;
                    }
                }
                `,
                isLocked: false,
                condition: true,
                title: '',
                children: [
                    {
                        componentName: 'FButton',
                        id: 'fButton2',
                        ref: 'fButton2',
                        props: {
                            children: '按钮',
                        },
                        isLocked: false,
                        condition: true,
                        title: '',
                        events: [
                            {
                                id: 'event_lwrmfgb1',
                                name: 'onClick',
                                waitType: 'debounce',
                                action: 'runFunction',
                                funcBody: 'console.log(utils)',
                                params: [],
                                type: 'plain',
                            },
                        ],
                    },
                ],
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
